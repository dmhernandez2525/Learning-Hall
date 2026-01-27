import { getPayload } from 'payload';
import config from '@/payload.config';
import crypto from 'crypto';

export type WebhookEvent =
  | '*'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'course.created'
  | 'course.updated'
  | 'course.published'
  | 'enrollment.created'
  | 'enrollment.completed'
  | 'progress.updated'
  | 'lesson.completed'
  | 'quiz.completed'
  | 'certificate.issued'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'subscription.created'
  | 'subscription.canceled'
  | 'review.created';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
  tenantId?: string;
}

export interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
}

/**
 * Generate a webhook signing secret
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Create a new webhook endpoint
 */
export async function createWebhookEndpoint(params: {
  url: string;
  description?: string;
  tenantId?: string;
  events: WebhookEvent[];
  settings?: {
    retryOnFailure?: boolean;
    maxRetries?: number;
    timeout?: number;
    headers?: { key: string; value: string }[];
  };
}) {
  const payload = await getPayload({ config });

  const secret = generateWebhookSecret();

  const endpoint = await payload.create({
    collection: 'webhook-endpoints',
    data: {
      url: params.url,
      description: params.description,
      tenant: params.tenantId,
      secret,
      events: params.events,
      status: 'active',
      settings: {
        retryOnFailure: params.settings?.retryOnFailure ?? true,
        maxRetries: params.settings?.maxRetries ?? 3,
        timeout: params.settings?.timeout ?? 30,
        headers: params.settings?.headers,
      },
      stats: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        consecutiveFailures: 0,
      },
    },
  });

  return endpoint;
}

/**
 * Sign a webhook payload
 */
export function signPayload(payload: WebhookPayload, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signatureInput = `${timestamp}.${payloadString}`;

  const signature = crypto.createHmac('sha256', secret).update(signatureInput).digest('hex');

  return `t=${timestamp},v1=${signature}`;
}

/**
 * Verify a webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance = 300
): boolean {
  const parts = signature.split(',');
  const timestamp = parseInt(parts.find((p) => p.startsWith('t='))?.slice(2) || '0');
  const sig = parts.find((p) => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !sig) {
    return false;
  }

  // Check timestamp tolerance (default 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    return false;
  }

  // Compute expected signature
  const signatureInput = `${timestamp}.${payload}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(signatureInput).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
}

/**
 * Dispatch a webhook event to all subscribed endpoints
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>,
  tenantId?: string
) {
  const payloadCMS = await getPayload({ config });

  // Find all active endpoints subscribed to this event
  const endpoints = await payloadCMS.find({
    collection: 'webhook-endpoints',
    where: {
      and: [
        { status: { equals: 'active' } },
        tenantId ? { tenant: { equals: tenantId } } : {},
        {
          or: [{ events: { contains: event } }, { events: { contains: '*' } }],
        },
      ],
    },
    limit: 100,
  });

  const webhookPayload: WebhookPayload = {
    id: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
    data,
    tenantId,
  };

  // Deliver to each endpoint
  const results: { endpointId: string | number; result: DeliveryResult }[] = [];

  for (const endpoint of endpoints.docs) {
    const result = await deliverWebhook(endpoint, webhookPayload);
    results.push({ endpointId: endpoint.id, result });

    // Update endpoint stats
    await updateEndpointStats(endpoint.id, result);
  }

  return results;
}

/**
 * Deliver a webhook to a single endpoint
 */
async function deliverWebhook(
  endpoint: {
    id: string | number;
    url: string;
    secret: string;
    settings?: {
      timeout?: number;
      headers?: { key: string; value: string }[];
      retryOnFailure?: boolean;
      maxRetries?: number;
    };
  },
  payload: WebhookPayload,
  attempt = 1
): Promise<DeliveryResult> {
  const startTime = Date.now();
  const timeout = (endpoint.settings?.timeout || 30) * 1000;

  try {
    // Sign the payload
    const signature = signPayload(payload, endpoint.secret);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-ID': payload.id,
      'X-Webhook-Timestamp': payload.timestamp,
    };

    // Add custom headers
    if (endpoint.settings?.headers) {
      for (const h of endpoint.settings.headers) {
        headers[h.key] = h.value;
      }
    }

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;

    if (response.ok) {
      return { success: true, statusCode: response.status, duration };
    }

    // Non-2xx response
    const error = await response.text().catch(() => 'Unknown error');

    // Retry on server errors if configured
    if (
      endpoint.settings?.retryOnFailure &&
      attempt < (endpoint.settings.maxRetries || 3) &&
      response.status >= 500
    ) {
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      return deliverWebhook(endpoint, payload, attempt + 1);
    }

    return {
      success: false,
      statusCode: response.status,
      error: error.slice(0, 500),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Retry on network errors if configured
    if (endpoint.settings?.retryOnFailure && attempt < (endpoint.settings.maxRetries || 3)) {
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      return deliverWebhook(endpoint, payload, attempt + 1);
    }

    return {
      success: false,
      error: errorMessage,
      duration,
    };
  }
}

/**
 * Update webhook endpoint statistics
 */
async function updateEndpointStats(endpointId: string | number, result: DeliveryResult) {
  const payloadCMS = await getPayload({ config });

  const endpoint = await payloadCMS.findByID({
    collection: 'webhook-endpoints',
    id: endpointId,
  });

  if (!endpoint) return;

  const stats = endpoint.stats || {
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    consecutiveFailures: 0,
  };

  const now = new Date().toISOString();
  const consecutiveFailures = result.success ? 0 : (stats.consecutiveFailures || 0) + 1;

  // Disable endpoint after 10 consecutive failures
  const shouldDisable = consecutiveFailures >= 10;

  await payloadCMS.update({
    collection: 'webhook-endpoints',
    id: endpointId,
    data: {
      stats: {
        totalDeliveries: (stats.totalDeliveries || 0) + 1,
        successfulDeliveries: (stats.successfulDeliveries || 0) + (result.success ? 1 : 0),
        failedDeliveries: (stats.failedDeliveries || 0) + (result.success ? 0 : 1),
        lastDeliveryAt: now,
        lastSuccessAt: result.success ? now : stats.lastSuccessAt,
        lastFailureAt: result.success ? stats.lastFailureAt : now,
        consecutiveFailures,
      },
      status: shouldDisable ? 'failed' : endpoint.status,
      disabledAt: shouldDisable ? now : endpoint.disabledAt,
      disabledReason: shouldDisable ? 'Too many consecutive failures' : endpoint.disabledReason,
    },
  });
}

/**
 * Test a webhook endpoint
 */
export async function testWebhookEndpoint(endpointId: string | number) {
  const payloadCMS = await getPayload({ config });

  const endpoint = await payloadCMS.findByID({
    collection: 'webhook-endpoints',
    id: endpointId,
  });

  if (!endpoint) {
    throw new Error('Webhook endpoint not found');
  }

  const testPayload: WebhookPayload = {
    id: crypto.randomUUID(),
    event: 'user.created',
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: 'This is a test webhook delivery',
    },
  };

  const result = await deliverWebhook(
    {
      id: endpoint.id,
      url: endpoint.url,
      secret: endpoint.secret,
      settings: endpoint.settings as {
        timeout?: number;
        headers?: { key: string; value: string }[];
        retryOnFailure?: boolean;
        maxRetries?: number;
      },
    },
    testPayload
  );

  return result;
}

/**
 * Re-enable a disabled webhook endpoint
 */
export async function enableWebhookEndpoint(endpointId: string | number) {
  const payloadCMS = await getPayload({ config });

  await payloadCMS.update({
    collection: 'webhook-endpoints',
    id: endpointId,
    data: {
      status: 'active',
      disabledAt: null,
      disabledReason: null,
      stats: {
        consecutiveFailures: 0,
      },
    },
  });
}

/**
 * Disable a webhook endpoint
 */
export async function disableWebhookEndpoint(endpointId: string | number, reason?: string) {
  const payloadCMS = await getPayload({ config });

  await payloadCMS.update({
    collection: 'webhook-endpoints',
    id: endpointId,
    data: {
      status: 'disabled',
      disabledAt: new Date().toISOString(),
      disabledReason: reason,
    },
  });
}

/**
 * Delete a webhook endpoint
 */
export async function deleteWebhookEndpoint(endpointId: string | number) {
  const payloadCMS = await getPayload({ config });

  await payloadCMS.delete({
    collection: 'webhook-endpoints',
    id: endpointId,
  });
}

/**
 * List webhook endpoints for a tenant
 */
export async function listWebhookEndpoints(tenantId: string) {
  const payloadCMS = await getPayload({ config });

  const endpoints = await payloadCMS.find({
    collection: 'webhook-endpoints',
    where: { tenant: { equals: tenantId } },
    sort: '-createdAt',
    limit: 100,
  });

  // Don't return the secrets
  return endpoints.docs.map((e) => ({
    id: e.id,
    url: e.url,
    description: e.description,
    events: e.events,
    status: e.status,
    stats: e.stats,
    settings: {
      retryOnFailure: e.settings?.retryOnFailure,
      maxRetries: e.settings?.maxRetries,
      timeout: e.settings?.timeout,
    },
    createdAt: e.createdAt,
  }));
}

/**
 * Rotate webhook secret
 */
export async function rotateWebhookSecret(endpointId: string | number) {
  const payloadCMS = await getPayload({ config });

  const newSecret = generateWebhookSecret();

  await payloadCMS.update({
    collection: 'webhook-endpoints',
    id: endpointId,
    data: { secret: newSecret },
  });

  return newSecret;
}

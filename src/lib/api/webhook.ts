// Webhook Dispatcher
import { getPayload } from 'payload';
import config from '@/payload.config';
import * as crypto from 'crypto';

export type WebhookEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'course.created'
  | 'course.updated'
  | 'course.published'
  | 'course.deleted'
  | 'enrollment.created'
  | 'enrollment.completed'
  | 'enrollment.progress'
  | 'lesson.completed'
  | 'quiz.started'
  | 'quiz.completed'
  | 'quiz.passed'
  | 'quiz.failed'
  | 'certificate.issued'
  | 'payment.created'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  | 'review.created'
  | 'badge.earned';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface WebhookDeliveryResult {
  success: boolean;
  webhookId: string;
  statusCode?: number;
  error?: string;
  retryable: boolean;
}

// Generate webhook secret
export function generateWebhookSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

// Sign webhook payload
export function signWebhookPayload(
  payload: WebhookPayload,
  secret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signatureBase = `${timestamp}.${payloadString}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureBase)
    .digest('hex');

  return `t=${timestamp},v1=${signature}`;
}

// Verify webhook signature (for incoming webhooks)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance = 300 // 5 minutes
): boolean {
  const parts = signature.split(',');
  const timestamp = parseInt(parts.find((p) => p.startsWith('t='))?.substring(2) || '0', 10);
  const signaturePart = parts.find((p) => p.startsWith('v1='))?.substring(3);

  if (!timestamp || !signaturePart) {
    return false;
  }

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    return false;
  }

  // Verify signature
  const signatureBase = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureBase)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signaturePart),
    Buffer.from(expectedSignature)
  );
}

// Dispatch webhook event
export async function dispatchWebhookEvent(
  event: WebhookEvent,
  data: Record<string, unknown>,
  tenantId?: string,
  metadata?: Record<string, unknown>
): Promise<WebhookDeliveryResult[]> {
  const payload = await getPayload({ config });

  // Find all active webhooks subscribed to this event
  const webhooks = await payload.find({
    collection: 'webhooks',
    where: {
      status: { equals: 'active' },
      events: { contains: event },
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
  });

  const results: WebhookDeliveryResult[] = [];

  // Dispatch to each webhook
  for (const webhook of webhooks.docs) {
    const webhookPayload: WebhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata,
    };

    const result = await deliverWebhook(webhook, webhookPayload);
    results.push(result);
  }

  return results;
}

// Deliver webhook to a specific endpoint
async function deliverWebhook(
  webhook: {
    id: string | number;
    url: string;
    secret?: string | null;
    headers?: Array<{ key: string; value: string }> | null;
    retryPolicy?: { maxRetries?: number | null; retryDelay?: number | null } | null;
  },
  webhookPayload: WebhookPayload
): Promise<WebhookDeliveryResult> {
  const payload = await getPayload({ config });

  try {
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Learning-Hall-Webhook/1.0',
      'X-Webhook-ID': webhookPayload.id,
      'X-Webhook-Event': webhookPayload.event,
    };

    // Add signature if secret exists
    if (webhook.secret) {
      headers['X-Webhook-Signature'] = signWebhookPayload(webhookPayload, webhook.secret);
    }

    // Add custom headers
    if (webhook.headers) {
      for (const header of webhook.headers) {
        headers[header.key] = header.value;
      }
    }

    // Send webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
    });

    const success = response.ok;

    // Update webhook stats
    await payload.update({
      collection: 'webhooks',
      id: String(webhook.id),
      data: {
        stats: {
          deliveredCount: success ? { increment: 1 } : undefined,
          failedCount: !success ? { increment: 1 } : undefined,
          lastDeliveredAt: success ? new Date().toISOString() : undefined,
          lastFailedAt: !success ? new Date().toISOString() : undefined,
          lastError: !success ? `HTTP ${response.status}: ${response.statusText}` : undefined,
        },
        status: success ? 'active' : 'active', // Keep active unless too many failures
      } as Record<string, unknown>,
    });

    return {
      success,
      webhookId: String(webhook.id),
      statusCode: response.status,
      retryable: response.status >= 500,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update webhook stats
    await payload.update({
      collection: 'webhooks',
      id: String(webhook.id),
      data: {
        stats: {
          failedCount: { increment: 1 },
          lastFailedAt: new Date().toISOString(),
          lastError: errorMessage,
        },
      } as Record<string, unknown>,
    });

    return {
      success: false,
      webhookId: String(webhook.id),
      error: errorMessage,
      retryable: true,
    };
  }
}

// Queue webhook for retry
export async function queueWebhookRetry(
  webhookId: string,
  payload: WebhookPayload,
  attempt: number,
  maxRetries: number,
  delay: number
): Promise<void> {
  // In a production environment, this would use a proper job queue
  // For now, we'll use a simple setTimeout
  if (attempt < maxRetries) {
    setTimeout(async () => {
      const payloadClient = await getPayload({ config });
      const webhook = await payloadClient.findByID({
        collection: 'webhooks',
        id: webhookId,
      });

      if (webhook && webhook.status === 'active') {
        const result = await deliverWebhook(
          {
            id: webhook.id,
            url: webhook.url,
            secret: webhook.secret,
            headers: webhook.headers,
            retryPolicy: webhook.retryPolicy,
          },
          payload
        );

        if (!result.success && result.retryable) {
          await queueWebhookRetry(
            webhookId,
            payload,
            attempt + 1,
            maxRetries,
            delay * 2 // Exponential backoff
          );
        }
      }
    }, delay * 1000);
  }
}

// Log webhook delivery
export interface WebhookLog {
  webhookId: string;
  eventType: WebhookEvent;
  payload: WebhookPayload;
  response: {
    statusCode: number;
    body?: string;
  };
  timestamp: string;
  success: boolean;
  attempt: number;
}

// Create webhook event helpers for common events
export function createUserCreatedEvent(user: {
  id: string;
  email: string;
  name?: string;
}): { event: WebhookEvent; data: Record<string, unknown> } {
  return {
    event: 'user.created',
    data: {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export function createEnrollmentCreatedEvent(enrollment: {
  userId: string;
  courseId: string;
  courseName: string;
}): { event: WebhookEvent; data: Record<string, unknown> } {
  return {
    event: 'enrollment.created',
    data: {
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      courseName: enrollment.courseName,
    },
  };
}

export function createEnrollmentCompletedEvent(enrollment: {
  userId: string;
  courseId: string;
  courseName: string;
  completedAt: string;
  progress: number;
}): { event: WebhookEvent; data: Record<string, unknown> } {
  return {
    event: 'enrollment.completed',
    data: enrollment,
  };
}

export function createPaymentCompletedEvent(payment: {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  courseId?: string;
  subscriptionId?: string;
}): { event: WebhookEvent; data: Record<string, unknown> } {
  return {
    event: 'payment.completed',
    data: payment,
  };
}

export function createCertificateIssuedEvent(certificate: {
  certificateId: string;
  userId: string;
  courseId: string;
  courseName: string;
  issuedAt: string;
  verificationUrl: string;
}): { event: WebhookEvent; data: Record<string, unknown> } {
  return {
    event: 'certificate.issued',
    data: certificate,
  };
}

import { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { withAPIAuth, APIContext } from '@/lib/api/middleware';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { generateWebhookSecret } from '@/lib/api/webhook';

// GET /api/v1/webhooks/:id - Get webhook by ID
async function handleGet(
  request: NextRequest,
  context: APIContext
) {
  const id = request.url.split('/webhooks/')[1]?.split('?')[0];
  if (!id) {
    return ApiErrors.badRequest('Webhook ID is required');
  }

  const payload = await getPayload({ config });

  try {
    const webhook = await payload.findByID({
      collection: 'webhooks',
      id,
    });

    if (!webhook) {
      return ApiErrors.notFound('Webhook');
    }

    // Check tenant access
    if (context.tenantId && webhook.tenant !== context.tenantId) {
      return ApiErrors.notFound('Webhook');
    }

    // Check user access (non-admin can only see their own)
    if (
      !context.apiKey.scopes.includes('admin') &&
      context.userId &&
      webhook.createdBy !== context.userId
    ) {
      return ApiErrors.forbidden();
    }

    return successResponse({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      status: webhook.status,
      headers: webhook.headers,
      retryPolicy: webhook.retryPolicy,
      stats: {
        deliveredCount: webhook.stats?.deliveredCount || 0,
        failedCount: webhook.stats?.failedCount || 0,
        lastDeliveredAt: webhook.stats?.lastDeliveredAt,
        lastFailedAt: webhook.stats?.lastFailedAt,
        lastError: webhook.stats?.lastError,
      },
      createdAt: webhook.createdAt,
      updatedAt: webhook.updatedAt,
    });
  } catch {
    return ApiErrors.notFound('Webhook');
  }
}

// PATCH /api/v1/webhooks/:id - Update webhook
async function handlePatch(
  request: NextRequest,
  context: APIContext
) {
  const id = request.url.split('/webhooks/')[1]?.split('?')[0];
  if (!id) {
    return ApiErrors.badRequest('Webhook ID is required');
  }

  const body = await request.json();
  const payload = await getPayload({ config });

  try {
    const webhook = await payload.findByID({
      collection: 'webhooks',
      id,
    });

    if (!webhook) {
      return ApiErrors.notFound('Webhook');
    }

    // Check tenant access
    if (context.tenantId && webhook.tenant !== context.tenantId) {
      return ApiErrors.forbidden();
    }

    // Check user access
    if (
      !context.apiKey.scopes.includes('admin') &&
      context.userId &&
      webhook.createdBy !== context.userId
    ) {
      return ApiErrors.forbidden();
    }

    // Only allow updating certain fields
    const allowedFields = ['name', 'url', 'events', 'headers', 'status', 'retryPolicy'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return ApiErrors.badRequest('Invalid URL format');
      }
    }

    const updatedWebhook = await payload.update({
      collection: 'webhooks',
      id,
      data: updateData,
    });

    return successResponse({
      id: updatedWebhook.id,
      name: updatedWebhook.name,
      url: updatedWebhook.url,
      events: updatedWebhook.events,
      status: updatedWebhook.status,
      updatedAt: updatedWebhook.updatedAt,
    });
  } catch {
    return ApiErrors.notFound('Webhook');
  }
}

// DELETE /api/v1/webhooks/:id - Delete webhook
async function handleDelete(
  request: NextRequest,
  context: APIContext
) {
  const id = request.url.split('/webhooks/')[1]?.split('?')[0];
  if (!id) {
    return ApiErrors.badRequest('Webhook ID is required');
  }

  const payload = await getPayload({ config });

  try {
    const webhook = await payload.findByID({
      collection: 'webhooks',
      id,
    });

    if (!webhook) {
      return ApiErrors.notFound('Webhook');
    }

    // Check tenant access
    if (context.tenantId && webhook.tenant !== context.tenantId) {
      return ApiErrors.forbidden();
    }

    // Check user access
    if (
      !context.apiKey.scopes.includes('admin') &&
      context.userId &&
      webhook.createdBy !== context.userId
    ) {
      return ApiErrors.forbidden();
    }

    await payload.delete({
      collection: 'webhooks',
      id,
    });

    return successResponse({ deleted: true });
  } catch {
    return ApiErrors.notFound('Webhook');
  }
}

// POST /api/v1/webhooks/:id/rotate-secret - Rotate webhook secret
async function handleRotateSecret(
  request: NextRequest,
  context: APIContext
) {
  const pathParts = request.url.split('/webhooks/')[1]?.split('/');
  const id = pathParts?.[0];

  if (!id) {
    return ApiErrors.badRequest('Webhook ID is required');
  }

  const payload = await getPayload({ config });

  try {
    const webhook = await payload.findByID({
      collection: 'webhooks',
      id,
    });

    if (!webhook) {
      return ApiErrors.notFound('Webhook');
    }

    // Check access
    if (context.tenantId && webhook.tenant !== context.tenantId) {
      return ApiErrors.forbidden();
    }

    if (
      !context.apiKey.scopes.includes('admin') &&
      context.userId &&
      webhook.createdBy !== context.userId
    ) {
      return ApiErrors.forbidden();
    }

    // Generate new secret
    const newSecret = generateWebhookSecret();

    await payload.update({
      collection: 'webhooks',
      id,
      data: { secret: newSecret },
    });

    return successResponse({
      id: webhook.id,
      secret: newSecret, // Return new secret
    });
  } catch {
    return ApiErrors.notFound('Webhook');
  }
}

export const GET = withAPIAuth(handleGet, {
  requiredScopes: ['webhooks:manage'],
  rateLimit: true,
  cors: true,
});

export const PATCH = withAPIAuth(handlePatch, {
  requiredScopes: ['webhooks:manage'],
  rateLimit: true,
  cors: true,
});

export const DELETE = withAPIAuth(handleDelete, {
  requiredScopes: ['webhooks:manage'],
  rateLimit: true,
  cors: true,
});

export const POST = withAPIAuth(handleRotateSecret, {
  requiredScopes: ['webhooks:manage'],
  rateLimit: true,
  cors: true,
});

export const OPTIONS = withAPIAuth(async () => new Response(null, { status: 204 }), {
  cors: true,
});

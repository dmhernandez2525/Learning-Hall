import { NextRequest } from 'next/server';
import { getPayload, Where } from 'payload';
import config from '@/payload.config';
import { withAPIAuth, APIContext } from '@/lib/api/middleware';
import {
  successResponse,
  ApiErrors,
  parsePaginationParams,
  buildPaginationMeta,
} from '@/lib/api/response';
import { generateWebhookSecret } from '@/lib/api/webhook';

// GET /api/v1/webhooks - List webhooks
async function handleGet(request: NextRequest, context: APIContext) {
  const { searchParams } = new URL(request.url);
  const pagination = parsePaginationParams(searchParams);

  const payload = await getPayload({ config });

  // Build query filters
  const where: Where = {};

  // Filter by tenant if API key has tenant
  if (context.tenantId) {
    where.tenant = { equals: context.tenantId };
  }

  // Filter by user (API key owner)
  if (context.userId) {
    where.createdBy = { equals: context.userId };
  }

  // Filter by status
  const status = searchParams.get('status');
  if (status) {
    where.status = { equals: status };
  }

  const webhooks = await payload.find({
    collection: 'webhooks',
    where,
    page: pagination.page,
    limit: pagination.limit,
    sort: `${pagination.order === 'desc' ? '-' : ''}${pagination.sort}`,
  });

  // Transform for API response (hide secret)
  const data = webhooks.docs.map((webhook) => ({
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    events: webhook.events,
    status: webhook.status,
    stats: {
      deliveredCount: webhook.stats?.deliveredCount || 0,
      failedCount: webhook.stats?.failedCount || 0,
      lastDeliveredAt: webhook.stats?.lastDeliveredAt,
      lastFailedAt: webhook.stats?.lastFailedAt,
    },
    createdAt: webhook.createdAt,
    updatedAt: webhook.updatedAt,
  }));

  return successResponse(
    data,
    buildPaginationMeta(pagination.page!, pagination.limit!, webhooks.totalDocs)
  );
}

// POST /api/v1/webhooks - Create webhook
async function handlePost(request: NextRequest, context: APIContext) {
  // Check for webhooks scope
  if (
    !context.apiKey.scopes.includes('webhooks:manage') &&
    !context.apiKey.scopes.includes('admin')
  ) {
    return ApiErrors.insufficientScopes(['webhooks:manage']);
  }

  const body = await request.json();
  const { name, url, events, headers } = body;

  if (!name || !url || !events || events.length === 0) {
    return ApiErrors.badRequest('name, url, and events are required');
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return ApiErrors.badRequest('Invalid URL format');
  }

  const payload = await getPayload({ config });

  // Generate secret
  const secret = generateWebhookSecret();

  const webhook = await payload.create({
    collection: 'webhooks',
    data: {
      name,
      url,
      events,
      headers: headers || [],
      secret,
      status: 'active',
      createdBy: context.userId || undefined,
      tenant: context.tenantId || undefined,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 60,
      },
      stats: {
        deliveredCount: 0,
        failedCount: 0,
      },
    },
  });

  // Return webhook with secret (only shown once on creation)
  return successResponse(
    {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret, // Only returned on creation
      status: webhook.status,
    },
    undefined,
    201
  );
}

export const GET = withAPIAuth(handleGet, {
  requiredScopes: ['webhooks:manage'],
  rateLimit: true,
  cors: true,
});

export const POST = withAPIAuth(handlePost, {
  requiredScopes: ['webhooks:manage'],
  rateLimit: true,
  cors: true,
});

export const OPTIONS = withAPIAuth(async () => new Response(null, { status: 204 }), {
  cors: true,
});

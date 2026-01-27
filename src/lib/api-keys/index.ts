import { getPayload } from 'payload';
import config from '@/payload.config';
import crypto from 'crypto';

export type APIScope =
  | 'courses:read'
  | 'courses:write'
  | 'users:read'
  | 'users:write'
  | 'enrollments:read'
  | 'enrollments:write'
  | 'progress:read'
  | 'progress:write'
  | 'analytics:read'
  | 'webhooks:manage'
  | 'admin';

export interface CreateAPIKeyParams {
  name: string;
  tenantId?: string;
  createdById: string;
  scopes: APIScope[];
  ipWhitelist?: string[];
  requestsPerMinute?: number;
  requestsPerDay?: number;
  expiresAt?: Date;
}

export interface ValidateKeyResult {
  valid: boolean;
  apiKey?: {
    id: string | number;
    name: string;
    tenantId?: string;
    scopes: APIScope[];
  };
  error?: string;
}

/**
 * Generate a new API key
 */
export function generateAPIKey(prefix = 'lh_live_'): { key: string; hash: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${randomBytes}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, hash };
}

/**
 * Create a new API key
 */
export async function createAPIKey(params: CreateAPIKeyParams) {
  const payload = await getPayload({ config });

  const { key, hash } = generateAPIKey();

  const apiKey = await payload.create({
    collection: 'api-keys',
    data: {
      name: params.name,
      key: hash, // Store only the hash
      keyPrefix: 'lh_live_',
      tenant: params.tenantId,
      createdBy: params.createdById,
      permissions: {
        scopes: params.scopes,
        ipWhitelist: params.ipWhitelist?.map((ip) => ({ ip })),
      },
      rateLimit: {
        requestsPerMinute: params.requestsPerMinute ?? 60,
        requestsPerDay: params.requestsPerDay ?? 10000,
      },
      status: 'active',
      expiresAt: params.expiresAt?.toISOString(),
      usage: {
        totalRequests: 0,
        requestsToday: 0,
        lastResetAt: new Date().toISOString(),
      },
    },
  });

  // Return the unhashed key only once
  return {
    ...apiKey,
    plaintextKey: key, // This is only returned on creation
  };
}

/**
 * Validate an API key
 */
export async function validateAPIKey(
  plaintextKey: string,
  requiredScope?: APIScope,
  clientIP?: string
): Promise<ValidateKeyResult> {
  const payload = await getPayload({ config });

  // Hash the provided key
  const hash = crypto.createHash('sha256').update(plaintextKey).digest('hex');

  // Find the API key
  const result = await payload.find({
    collection: 'api-keys',
    where: {
      key: { equals: hash },
    },
    limit: 1,
  });

  if (result.docs.length === 0) {
    return { valid: false, error: 'Invalid API key' };
  }

  const apiKey = result.docs[0];

  // Check status
  if (apiKey.status !== 'active') {
    return { valid: false, error: `API key is ${apiKey.status}` };
  }

  // Check expiration
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    await payload.update({
      collection: 'api-keys',
      id: apiKey.id,
      data: { status: 'expired' },
    });
    return { valid: false, error: 'API key has expired' };
  }

  // Check IP whitelist
  const ipWhitelist = (apiKey.permissions?.ipWhitelist as { ip: string }[]) || [];
  if (ipWhitelist.length > 0 && clientIP) {
    const allowed = ipWhitelist.some((entry) => entry.ip === clientIP);
    if (!allowed) {
      return { valid: false, error: 'IP address not allowed' };
    }
  }

  // Check scope
  const scopes = (apiKey.permissions?.scopes as APIScope[]) || [];
  if (requiredScope && !scopes.includes('admin') && !scopes.includes(requiredScope)) {
    return { valid: false, error: `Missing required scope: ${requiredScope}` };
  }

  // Update usage stats
  await updateUsageStats(apiKey.id);

  return {
    valid: true,
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      tenantId: apiKey.tenant as string | undefined,
      scopes,
    },
  };
}

/**
 * Update API key usage statistics
 */
async function updateUsageStats(apiKeyId: string | number) {
  const payload = await getPayload({ config });

  const apiKey = await payload.findByID({
    collection: 'api-keys',
    id: apiKeyId,
  });

  if (!apiKey) return;

  const now = new Date();
  const lastReset = apiKey.usage?.lastResetAt ? new Date(apiKey.usage.lastResetAt) : now;
  const isNewDay = now.toDateString() !== lastReset.toDateString();

  await payload.update({
    collection: 'api-keys',
    id: apiKeyId,
    data: {
      lastUsedAt: now.toISOString(),
      usage: {
        totalRequests: (apiKey.usage?.totalRequests || 0) + 1,
        requestsToday: isNewDay ? 1 : (apiKey.usage?.requestsToday || 0) + 1,
        lastResetAt: isNewDay ? now.toISOString() : apiKey.usage?.lastResetAt,
      },
    },
  });
}

/**
 * Check rate limits for an API key
 */
export async function checkRateLimit(apiKeyId: string | number): Promise<{
  allowed: boolean;
  remaining: { perMinute: number; perDay: number };
  error?: string;
}> {
  const payload = await getPayload({ config });

  const apiKey = await payload.findByID({
    collection: 'api-keys',
    id: apiKeyId,
  });

  if (!apiKey) {
    return { allowed: false, remaining: { perMinute: 0, perDay: 0 }, error: 'API key not found' };
  }

  const limits = apiKey.rateLimit || { requestsPerMinute: 60, requestsPerDay: 10000 };
  const usage = apiKey.usage || { requestsToday: 0 };

  // Check daily limit
  if ((usage.requestsToday || 0) >= (limits.requestsPerDay || 10000)) {
    return {
      allowed: false,
      remaining: { perMinute: 0, perDay: 0 },
      error: 'Daily rate limit exceeded',
    };
  }

  // For per-minute rate limiting, we'd need Redis or similar
  // For now, just return allowed with remaining counts
  return {
    allowed: true,
    remaining: {
      perMinute: limits.requestsPerMinute || 60,
      perDay: (limits.requestsPerDay || 10000) - (usage.requestsToday || 0),
    },
  };
}

/**
 * Revoke an API key
 */
export async function revokeAPIKey(
  apiKeyId: string | number,
  revokedById: string,
  reason?: string
) {
  const payload = await getPayload({ config });

  await payload.update({
    collection: 'api-keys',
    id: apiKeyId,
    data: {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revokedBy: revokedById,
      revokeReason: reason,
    },
  });
}

/**
 * List API keys for a tenant
 */
export async function listAPIKeys(tenantId: string, includeRevoked = false) {
  const payload = await getPayload({ config });

  const where = includeRevoked
    ? { tenant: { equals: tenantId } }
    : {
        and: [{ tenant: { equals: tenantId } }, { status: { not_equals: 'revoked' } }],
      };

  const keys = await payload.find({
    collection: 'api-keys',
    where,
    sort: '-createdAt',
    limit: 100,
  });

  // Don't return the key hashes
  return keys.docs.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    scopes: k.permissions?.scopes,
    status: k.status,
    expiresAt: k.expiresAt,
    lastUsedAt: k.lastUsedAt,
    usage: k.usage,
    createdAt: k.createdAt,
  }));
}

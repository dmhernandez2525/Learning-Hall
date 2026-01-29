// API Key Management
import { getPayload } from 'payload';
import config from '@/payload.config';
import * as crypto from 'crypto';
import { NextRequest } from 'next/server';

export interface APIKeyData {
  id: string;
  name: string;
  scopes: string[];
  tenantId: string | null;
  userId: string | null;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  ipWhitelist: string[];
}

export interface ValidatedAPIKey extends APIKeyData {
  isValid: boolean;
  error?: string;
}

// Generate a new API key
export function generateAPIKey(): { key: string; hash: string; prefix: string } {
  const prefix = 'lh_';
  const key = prefix + crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  return {
    key,
    hash,
    prefix: key.substring(0, 12) + '...',
  };
}

// Hash an API key for comparison
export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Extract API key from request
export function extractAPIKey(request: NextRequest): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check query parameter (less secure, but useful for testing)
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('api_key');
  if (queryKey) {
    return queryKey;
  }

  return null;
}

// Validate an API key
export async function validateAPIKey(
  key: string,
  requiredScopes: string[] = []
): Promise<ValidatedAPIKey> {
  const payload = await getPayload({ config });

  const keyHash = hashAPIKey(key);

  // Find API key by hash
  const apiKeys = await payload.find({
    collection: 'api-keys',
    where: {
      key: { equals: key },
      status: { equals: 'active' },
    },
    limit: 1,
  });

  if (apiKeys.docs.length === 0) {
    return {
      isValid: false,
      error: 'Invalid or revoked API key',
      id: '',
      name: '',
      scopes: [],
      tenantId: null,
      userId: null,
      rateLimit: { requestsPerMinute: 0, requestsPerDay: 0 },
      ipWhitelist: [],
    };
  }

  const apiKey = apiKeys.docs[0];

  // Check expiration
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    // Mark as expired
    await payload.update({
      collection: 'api-keys',
      id: apiKey.id,
      data: { status: 'expired' },
    });

    return {
      isValid: false,
      error: 'API key has expired',
      id: String(apiKey.id),
      name: apiKey.name,
      scopes: [],
      tenantId: null,
      userId: null,
      rateLimit: { requestsPerMinute: 0, requestsPerDay: 0 },
      ipWhitelist: [],
    };
  }

  // Extract scopes
  const scopes = (apiKey.permissions?.scopes as string[]) || [];

  // Check required scopes
  if (requiredScopes.length > 0) {
    const hasAdminScope = scopes.includes('admin');
    const hasRequiredScopes = requiredScopes.every((scope) => {
      // Check for exact match or wildcard
      if (scopes.includes(scope)) return true;
      // Check for category access (e.g., 'courses:read' matches 'courses')
      const [category] = scope.split(':');
      if (scopes.includes(category)) return true;
      return false;
    });

    if (!hasAdminScope && !hasRequiredScopes) {
      return {
        isValid: false,
        error: `Missing required scopes: ${requiredScopes.join(', ')}`,
        id: String(apiKey.id),
        name: apiKey.name,
        scopes,
        tenantId: apiKey.tenant ? String(apiKey.tenant) : null,
        userId: apiKey.createdBy ? String(apiKey.createdBy) : null,
        rateLimit: {
          requestsPerMinute: apiKey.rateLimit?.requestsPerMinute || 60,
          requestsPerDay: apiKey.rateLimit?.requestsPerDay || 10000,
        },
        ipWhitelist: apiKey.permissions?.ipWhitelist?.map((ip: { ip: string }) => ip.ip) || [],
      };
    }
  }

  // Update last used timestamp
  await payload.update({
    collection: 'api-keys',
    id: apiKey.id,
    data: {
      lastUsedAt: new Date().toISOString(),
      usage: {
        totalRequests: (apiKey.usage?.totalRequests || 0) + 1,
        requestsToday: (apiKey.usage?.requestsToday || 0) + 1,
        lastResetAt: apiKey.usage?.lastResetAt || new Date().toISOString(),
      },
    },
  });

  return {
    isValid: true,
    id: String(apiKey.id),
    name: apiKey.name,
    scopes,
    tenantId: apiKey.tenant ? String(apiKey.tenant) : null,
    userId: apiKey.createdBy ? String(apiKey.createdBy) : null,
    rateLimit: {
      requestsPerMinute: apiKey.rateLimit?.requestsPerMinute || 60,
      requestsPerDay: apiKey.rateLimit?.requestsPerDay || 10000,
    },
    ipWhitelist: apiKey.permissions?.ipWhitelist?.map((ip: { ip: string }) => ip.ip) || [],
  };
}

// Check IP whitelist
export function checkIPWhitelist(
  clientIP: string,
  whitelist: string[]
): boolean {
  // Empty whitelist means all IPs are allowed
  if (whitelist.length === 0) {
    return true;
  }

  return whitelist.some((allowedIP) => {
    // Support CIDR notation in future
    return allowedIP === clientIP || allowedIP === '*';
  });
}

// Get client IP from request
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback (usually localhost in development)
  return '127.0.0.1';
}

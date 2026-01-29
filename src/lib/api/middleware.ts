// API Middleware
import { NextRequest, NextResponse } from 'next/server';
import {
  extractAPIKey,
  validateAPIKey,
  checkIPWhitelist,
  getClientIP,
  ValidatedAPIKey,
} from './api-key';
import { checkRateLimit, addRateLimitHeaders } from './rate-limit';
import { ApiErrors, addCORSHeaders, addVersionHeader } from './response';

export interface APIContext {
  apiKey: ValidatedAPIKey;
  tenantId: string | null;
  userId: string | null;
}

export type APIHandler = (
  request: NextRequest,
  context: APIContext
) => Promise<NextResponse>;

// Middleware wrapper for API routes
export function withAPIAuth(
  handler: APIHandler,
  options: {
    requiredScopes?: string[];
    rateLimit?: boolean;
    cors?: boolean | string;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS' && options.cors !== false) {
      const origin = typeof options.cors === 'string' ? options.cors : '*';
      const response = new NextResponse(null, { status: 204 });
      addCORSHeaders(response, origin);
      return response;
    }

    // Extract API key
    const key = extractAPIKey(request);
    if (!key) {
      return ApiErrors.unauthorized();
    }

    // Validate API key
    const apiKey = await validateAPIKey(key, options.requiredScopes || []);
    if (!apiKey.isValid) {
      if (apiKey.error?.includes('scopes')) {
        return ApiErrors.insufficientScopes(options.requiredScopes || []);
      }
      return ApiErrors.invalidApiKey();
    }

    // Check IP whitelist
    if (apiKey.ipWhitelist.length > 0) {
      const clientIP = getClientIP(request);
      if (!checkIPWhitelist(clientIP, apiKey.ipWhitelist)) {
        return ApiErrors.forbidden();
      }
    }

    // Check rate limit
    if (options.rateLimit !== false) {
      const rateLimitResult = checkRateLimit(apiKey.id, apiKey.rateLimit);
      if (!rateLimitResult.allowed) {
        return ApiErrors.rateLimitExceeded(rateLimitResult.reset);
      }
    }

    // Build context
    const context: APIContext = {
      apiKey,
      tenantId: apiKey.tenantId,
      userId: apiKey.userId,
    };

    // Call handler
    try {
      let response = await handler(request, context);

      // Add standard headers
      response = addVersionHeader(response);

      // Add CORS headers
      if (options.cors !== false) {
        const origin = typeof options.cors === 'string' ? options.cors : '*';
        response = addCORSHeaders(response, origin);
      }

      // Add rate limit headers
      if (options.rateLimit !== false) {
        const rateLimitResult = checkRateLimit(apiKey.id, apiKey.rateLimit);
        response = addRateLimitHeaders(response, {
          limit: apiKey.rateLimit.requestsPerMinute,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        });
      }

      return response;
    } catch (error) {
      console.error('API Error:', error);
      return ApiErrors.internalError();
    }
  };
}

// Simple auth check without full middleware (for internal API routes)
export async function checkAPIAuth(
  request: NextRequest,
  requiredScopes: string[] = []
): Promise<{ valid: boolean; context?: APIContext; error?: NextResponse }> {
  const key = extractAPIKey(request);
  if (!key) {
    return { valid: false, error: ApiErrors.unauthorized() };
  }

  const apiKey = await validateAPIKey(key, requiredScopes);
  if (!apiKey.isValid) {
    if (apiKey.error?.includes('scopes')) {
      return { valid: false, error: ApiErrors.insufficientScopes(requiredScopes) };
    }
    return { valid: false, error: ApiErrors.invalidApiKey() };
  }

  return {
    valid: true,
    context: {
      apiKey,
      tenantId: apiKey.tenantId,
      userId: apiKey.userId,
    },
  };
}

// Export helper types
export type { ValidatedAPIKey };

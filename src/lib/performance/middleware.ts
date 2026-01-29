// Performance Middleware for API Routes
import { NextRequest, NextResponse } from 'next/server';
import { createRequestTimer, metricsCollector } from './monitoring';
import { checkRateLimit } from './redis';
import { withCache, CacheNamespaces } from './cache';

// Middleware configuration
export interface PerformanceMiddlewareConfig {
  enableMetrics?: boolean;
  enableRateLimit?: boolean;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
  enableCache?: boolean;
  cacheTtl?: number;
  cacheNamespace?: keyof typeof CacheNamespaces;
}

const defaultConfig: PerformanceMiddlewareConfig = {
  enableMetrics: true,
  enableRateLimit: false,
  rateLimitRequests: 100,
  rateLimitWindow: 60000,
  enableCache: false,
  cacheTtl: 60000,
};

// Create wrapped handler with performance features
export function withPerformance<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  config: PerformanceMiddlewareConfig = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };

  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    const timer = mergedConfig.enableMetrics ? createRequestTimer() : null;

    try {
      // Rate limiting
      if (mergedConfig.enableRateLimit && process.env.REDIS_URL) {
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
          request.headers.get('x-real-ip') ||
          'unknown';

        const rateLimit = await checkRateLimit(
          `api:${clientIp}`,
          mergedConfig.rateLimitRequests!,
          mergedConfig.rateLimitWindow!
        );

        if (!rateLimit.allowed) {
          const response = NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          ) as NextResponse<{ error: string }>;

          response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
          response.headers.set('X-RateLimit-Reset', String(rateLimit.resetAt));

          if (timer) {
            timer.end(request.nextUrl.pathname, request.method, 429);
          }

          return response;
        }
      }

      // Execute handler
      const response = await handler(request);

      // Record metrics
      if (timer) {
        timer.end(
          request.nextUrl.pathname,
          request.method,
          response.status
        );
      }

      // Add performance headers
      response.headers.set('X-Response-Time', String(Date.now()));

      return response;
    } catch (error) {
      // Record error
      if (mergedConfig.enableMetrics) {
        metricsCollector.recordError(error as Error, {
          path: request.nextUrl.pathname,
          method: request.method,
        });
      }

      if (timer) {
        timer.end(request.nextUrl.pathname, request.method, 500);
      }

      throw error;
    }
  };
}

// Cache wrapper for GET endpoints
export function withCachedResponse<T>(
  handler: (request: NextRequest) => Promise<T>,
  config: {
    namespace: keyof typeof CacheNamespaces;
    ttl?: number;
    keyGenerator?: (request: NextRequest) => string;
  }
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const cacheKey = config.keyGenerator
      ? config.keyGenerator(request)
      : `${request.nextUrl.pathname}?${request.nextUrl.searchParams.toString()}`;

    const namespace = CacheNamespaces[config.namespace];

    const data = await withCache(
      namespace,
      cacheKey,
      () => handler(request),
      { ttl: config.ttl || 60000 }
    );

    const response = NextResponse.json(data);
    response.headers.set('X-Cache', 'HIT');

    return response;
  };
}

// Compression middleware helper
export function shouldCompress(
  request: NextRequest,
  contentLength: number
): boolean {
  // Don't compress small responses
  if (contentLength < 1024) return false;

  // Check if client accepts compression
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  return acceptEncoding.includes('gzip') || acceptEncoding.includes('br');
}

// CORS headers helper
export function addCorsHeaders(
  response: NextResponse,
  origin?: string
): NextResponse {
  const allowedOrigin = origin || process.env.NEXT_PUBLIC_URL || '*';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

// Security headers helper
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// ETag helper for caching
export function generateETag(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

// Check if content has changed (for conditional requests)
export function isNotModified(request: NextRequest, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  return ifNoneMatch === etag;
}

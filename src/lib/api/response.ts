// API Response Utilities
import { NextResponse } from 'next/server';

// Standard API response format
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Success response
export function successResponse<T>(
  data: T,
  meta?: APIResponse['meta'],
  status = 200
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

// Error response
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

// Common error responses
export const ApiErrors = {
  unauthorized: () =>
    errorResponse('UNAUTHORIZED', 'Authentication required', 401),

  forbidden: () =>
    errorResponse('FORBIDDEN', 'You do not have permission to access this resource', 403),

  notFound: (resource = 'Resource') =>
    errorResponse('NOT_FOUND', `${resource} not found`, 404),

  badRequest: (message: string, details?: Record<string, unknown>) =>
    errorResponse('BAD_REQUEST', message, 400, details),

  validationError: (details: Record<string, unknown>) =>
    errorResponse('VALIDATION_ERROR', 'Validation failed', 400, details),

  rateLimitExceeded: (retryAfter: number) =>
    errorResponse(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.',
      429,
      { retryAfter }
    ),

  internalError: (message = 'An unexpected error occurred') =>
    errorResponse('INTERNAL_ERROR', message, 500),

  methodNotAllowed: (allowed: string[]) =>
    errorResponse(
      'METHOD_NOT_ALLOWED',
      `Method not allowed. Allowed methods: ${allowed.join(', ')}`,
      405,
      { allowedMethods: allowed }
    ),

  invalidApiKey: () =>
    errorResponse('INVALID_API_KEY', 'Invalid or expired API key', 401),

  insufficientScopes: (required: string[]) =>
    errorResponse(
      'INSUFFICIENT_SCOPES',
      `Missing required permissions: ${required.join(', ')}`,
      403,
      { requiredScopes: required }
    ),
};

// Pagination helpers
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10))),
    sort: searchParams.get('sort') || 'createdAt',
    order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): APIResponse['meta'] {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// Filter helpers
export interface FilterParams {
  [key: string]: string | string[] | undefined;
}

export function parseFilterParams(
  searchParams: URLSearchParams,
  allowedFilters: string[]
): FilterParams {
  const filters: FilterParams = {};

  for (const key of allowedFilters) {
    const value = searchParams.get(key);
    const values = searchParams.getAll(key);

    if (values.length > 1) {
      filters[key] = values;
    } else if (value) {
      filters[key] = value;
    }
  }

  return filters;
}

// CORS headers
export function addCORSHeaders(
  response: NextResponse,
  origin = '*'
): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// Handle CORS preflight
export function handleCORSPreflight(origin = '*'): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCORSHeaders(response, origin);
}

// API version header
export function addVersionHeader(
  response: NextResponse,
  version = '1.0'
): NextResponse {
  response.headers.set('X-API-Version', version);
  return response;
}

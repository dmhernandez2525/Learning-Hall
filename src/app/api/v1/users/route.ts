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

// GET /api/v1/users - List users
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

  // Additional filters
  const role = searchParams.get('role');
  if (role) {
    where.role = { equals: role };
  }

  const search = searchParams.get('search');
  if (search) {
    where.or = [
      { email: { contains: search } },
      { name: { contains: search } },
    ];
  }

  const users = await payload.find({
    collection: 'users',
    where,
    page: pagination.page,
    limit: pagination.limit,
    sort: `${pagination.order === 'desc' ? '-' : ''}${pagination.sort}`,
  });

  // Transform for API response (exclude sensitive fields)
  const data = users.docs.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return successResponse(
    data,
    buildPaginationMeta(pagination.page!, pagination.limit!, users.totalDocs)
  );
}

// POST /api/v1/users - Create user
async function handlePost(request: NextRequest, context: APIContext) {
  // Check for write scope
  if (
    !context.apiKey.scopes.includes('users:write') &&
    !context.apiKey.scopes.includes('admin')
  ) {
    return ApiErrors.insufficientScopes(['users:write']);
  }

  const body = await request.json();
  const { email, password, name, role } = body;

  if (!email || !password) {
    return ApiErrors.badRequest('Email and password are required');
  }

  const payload = await getPayload({ config });

  // Check if user already exists
  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existingUsers.docs.length > 0) {
    return ApiErrors.badRequest('User with this email already exists');
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name,
      role: role || 'student',
      tenant: context.tenantId || undefined,
    },
  });

  return successResponse(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    undefined,
    201
  );
}

export const GET = withAPIAuth(handleGet, {
  requiredScopes: ['users:read'],
  rateLimit: true,
  cors: true,
});

export const POST = withAPIAuth(handlePost, {
  requiredScopes: ['users:write'],
  rateLimit: true,
  cors: true,
});

export const OPTIONS = withAPIAuth(async () => new Response(null, { status: 204 }), {
  cors: true,
});

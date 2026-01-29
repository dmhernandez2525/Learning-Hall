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

// GET /api/v1/courses - List courses
async function handleGet(request: NextRequest, context: APIContext) {
  const { searchParams } = new URL(request.url);
  const pagination = parsePaginationParams(searchParams);

  const payload = await getPayload({ config });

  // Build query filters
  const where: Where = {
    status: { equals: 'published' },
  };

  // Filter by tenant if API key has tenant
  if (context.tenantId) {
    where.tenant = { equals: context.tenantId };
  }

  // Additional filters
  const category = searchParams.get('category');
  if (category) {
    where.category = { equals: category };
  }

  const level = searchParams.get('level');
  if (level) {
    where.level = { equals: level };
  }

  const search = searchParams.get('search');
  if (search) {
    where.or = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const courses = await payload.find({
    collection: 'courses',
    where,
    page: pagination.page,
    limit: pagination.limit,
    sort: `${pagination.order === 'desc' ? '-' : ''}${pagination.sort}`,
  });

  // Transform for API response
  const data = courses.docs.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    shortDescription: course.shortDescription,
    thumbnail: course.thumbnail,
    price: course.price,
    currency: course.currency,
    level: course.level,
    category: course.category,
    status: course.status,
    enrollmentCount: course.enrollmentCount || 0,
    averageRating: course.averageRating || 0,
    reviewCount: course.reviewCount || 0,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  }));

  return successResponse(
    data,
    buildPaginationMeta(pagination.page!, pagination.limit!, courses.totalDocs)
  );
}

// POST /api/v1/courses - Create course
async function handlePost(request: NextRequest, context: APIContext) {
  // Check for write scope
  if (
    !context.apiKey.scopes.includes('courses:write') &&
    !context.apiKey.scopes.includes('admin')
  ) {
    return ApiErrors.insufficientScopes(['courses:write']);
  }

  const body = await request.json();
  const { title, description, shortDescription, price, currency, level, category } = body;

  if (!title) {
    return ApiErrors.badRequest('Title is required');
  }

  const payload = await getPayload({ config });

  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const course = await payload.create({
    collection: 'courses',
    data: {
      title,
      slug,
      description,
      shortDescription,
      price: price || 0,
      currency: currency || 'USD',
      level: level || 'beginner',
      category,
      status: 'draft',
      tenant: context.tenantId || undefined,
      instructor: context.userId || undefined,
    },
  });

  return successResponse(
    {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
    },
    undefined,
    201
  );
}

export const GET = withAPIAuth(handleGet, {
  requiredScopes: ['courses:read'],
  rateLimit: true,
  cors: true,
});

export const POST = withAPIAuth(handlePost, {
  requiredScopes: ['courses:write'],
  rateLimit: true,
  cors: true,
});

export const OPTIONS = withAPIAuth(async () => new Response(null, { status: 204 }), {
  cors: true,
});

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
import { dispatchWebhookEvent } from '@/lib/api/webhook';

// GET /api/v1/enrollments - List enrollments
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

  // Filter by user
  const userId = searchParams.get('userId');
  if (userId) {
    where.user = { equals: userId };
  }

  // Filter by course
  const courseId = searchParams.get('courseId');
  if (courseId) {
    where.course = { equals: courseId };
  }

  // Filter by status
  const status = searchParams.get('status');
  if (status) {
    where.status = { equals: status };
  }

  const enrollments = await payload.find({
    collection: 'enrollments',
    where,
    page: pagination.page,
    limit: pagination.limit,
    sort: `${pagination.order === 'desc' ? '-' : ''}${pagination.sort}`,
    depth: 1,
  });

  // Transform for API response
  const data = enrollments.docs.map((enrollment) => ({
    id: enrollment.id,
    user: {
      id: typeof enrollment.user === 'object' ? enrollment.user.id : enrollment.user,
      email:
        typeof enrollment.user === 'object' ? enrollment.user.email : undefined,
      name: typeof enrollment.user === 'object' ? enrollment.user.name : undefined,
    },
    course: {
      id: typeof enrollment.course === 'object' ? enrollment.course.id : enrollment.course,
      title:
        typeof enrollment.course === 'object' ? enrollment.course.title : undefined,
    },
    status: enrollment.status,
    progress: enrollment.progress || 0,
    completedAt: enrollment.completedAt,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
  }));

  return successResponse(
    data,
    buildPaginationMeta(pagination.page!, pagination.limit!, enrollments.totalDocs)
  );
}

// POST /api/v1/enrollments - Create enrollment
async function handlePost(request: NextRequest, context: APIContext) {
  // Check for write scope
  if (
    !context.apiKey.scopes.includes('enrollments:write') &&
    !context.apiKey.scopes.includes('admin')
  ) {
    return ApiErrors.insufficientScopes(['enrollments:write']);
  }

  const body = await request.json();
  const { userId, courseId } = body;

  if (!userId || !courseId) {
    return ApiErrors.badRequest('userId and courseId are required');
  }

  const payload = await getPayload({ config });

  // Check if user exists
  try {
    await payload.findByID({ collection: 'users', id: userId });
  } catch {
    return ApiErrors.notFound('User');
  }

  // Check if course exists
  let course;
  try {
    course = await payload.findByID({ collection: 'courses', id: courseId });
  } catch {
    return ApiErrors.notFound('Course');
  }

  // Check if already enrolled
  const existingEnrollments = await payload.find({
    collection: 'enrollments',
    where: {
      user: { equals: userId },
      course: { equals: courseId },
    },
    limit: 1,
  });

  if (existingEnrollments.docs.length > 0) {
    return ApiErrors.badRequest('User is already enrolled in this course');
  }

  const enrollment = await payload.create({
    collection: 'enrollments',
    data: {
      user: userId,
      course: courseId,
      status: 'active',
      progress: 0,
      tenant: context.tenantId || undefined,
    },
  });

  // Dispatch webhook event
  await dispatchWebhookEvent(
    'enrollment.created',
    {
      enrollmentId: enrollment.id,
      userId,
      courseId,
      courseName: course.title,
    },
    context.tenantId || undefined
  );

  return successResponse(
    {
      id: enrollment.id,
      userId,
      courseId,
      status: enrollment.status,
    },
    undefined,
    201
  );
}

export const GET = withAPIAuth(handleGet, {
  requiredScopes: ['enrollments:read'],
  rateLimit: true,
  cors: true,
});

export const POST = withAPIAuth(handlePost, {
  requiredScopes: ['enrollments:write'],
  rateLimit: true,
  cors: true,
});

export const OPTIONS = withAPIAuth(async () => new Response(null, { status: 204 }), {
  cors: true,
});

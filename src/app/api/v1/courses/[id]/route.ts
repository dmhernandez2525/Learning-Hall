import { NextRequest } from 'next/server';
import { getPayload, Where } from 'payload';
import config from '@/payload.config';
import { withAPIAuth, APIContext } from '@/lib/api/middleware';
import { successResponse, ApiErrors } from '@/lib/api/response';

// GET /api/v1/courses/:id - Get course by ID
async function handleGet(
  request: NextRequest,
  context: APIContext
) {
  const id = request.url.split('/courses/')[1]?.split('?')[0];
  if (!id) {
    return ApiErrors.badRequest('Course ID is required');
  }

  const payload = await getPayload({ config });

  try {
    const course = await payload.findByID({
      collection: 'courses',
      id,
      depth: 2,
    });

    if (!course) {
      return ApiErrors.notFound('Course');
    }

    // Check tenant access
    if (context.tenantId && course.tenant !== context.tenantId) {
      return ApiErrors.notFound('Course');
    }

    // Transform for API response
    const data = {
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
      instructor: course.instructor
        ? {
            id: typeof course.instructor === 'object' ? course.instructor.id : course.instructor,
            name:
              typeof course.instructor === 'object'
                ? course.instructor.name || course.instructor.email
                : undefined,
          }
        : null,
      sections: course.sections || [],
      enrollmentCount: course.enrollmentCount || 0,
      averageRating: course.averageRating || 0,
      reviewCount: course.reviewCount || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return successResponse(data);
  } catch {
    return ApiErrors.notFound('Course');
  }
}

// PATCH /api/v1/courses/:id - Update course
async function handlePatch(
  request: NextRequest,
  context: APIContext
) {
  if (
    !context.apiKey.scopes.includes('courses:write') &&
    !context.apiKey.scopes.includes('admin')
  ) {
    return ApiErrors.insufficientScopes(['courses:write']);
  }

  const id = request.url.split('/courses/')[1]?.split('?')[0];
  if (!id) {
    return ApiErrors.badRequest('Course ID is required');
  }

  const body = await request.json();
  const payload = await getPayload({ config });

  try {
    // Verify course exists and belongs to tenant
    const existingCourse = await payload.findByID({
      collection: 'courses',
      id,
    });

    if (!existingCourse) {
      return ApiErrors.notFound('Course');
    }

    if (context.tenantId && existingCourse.tenant !== context.tenantId) {
      return ApiErrors.forbidden();
    }

    // Only allow updating certain fields
    const allowedFields = [
      'title',
      'description',
      'shortDescription',
      'price',
      'currency',
      'level',
      'category',
      'status',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update slug if title changed
    if (body.title && body.title !== existingCourse.title) {
      updateData.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const course = await payload.update({
      collection: 'courses',
      id,
      data: updateData,
    });

    return successResponse({
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      updatedAt: course.updatedAt,
    });
  } catch {
    return ApiErrors.notFound('Course');
  }
}

// DELETE /api/v1/courses/:id - Delete course
async function handleDelete(
  request: NextRequest,
  context: APIContext
) {
  if (
    !context.apiKey.scopes.includes('courses:write') &&
    !context.apiKey.scopes.includes('admin')
  ) {
    return ApiErrors.insufficientScopes(['courses:write']);
  }

  const id = request.url.split('/courses/')[1]?.split('?')[0];
  if (!id) {
    return ApiErrors.badRequest('Course ID is required');
  }

  const payload = await getPayload({ config });

  try {
    // Verify course exists and belongs to tenant
    const existingCourse = await payload.findByID({
      collection: 'courses',
      id,
    });

    if (!existingCourse) {
      return ApiErrors.notFound('Course');
    }

    if (context.tenantId && existingCourse.tenant !== context.tenantId) {
      return ApiErrors.forbidden();
    }

    await payload.delete({
      collection: 'courses',
      id,
    });

    return successResponse({ deleted: true });
  } catch {
    return ApiErrors.notFound('Course');
  }
}

export const GET = withAPIAuth(handleGet, {
  requiredScopes: ['courses:read'],
  rateLimit: true,
  cors: true,
});

export const PATCH = withAPIAuth(handlePatch, {
  requiredScopes: ['courses:write'],
  rateLimit: true,
  cors: true,
});

export const DELETE = withAPIAuth(handleDelete, {
  requiredScopes: ['courses:write'],
  rateLimit: true,
  cors: true,
});

export const OPTIONS = withAPIAuth(async () => new Response(null, { status: 204 }), {
  cors: true,
});

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Mobile-optimized course listing
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-createdAt';
    const enrolled = searchParams.get('enrolled') === 'true';

    // Get user from auth header (simplified - in production use proper token validation)
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      // In production, validate token and get user ID
      // For now, check X-User-Id header for testing
      userId = request.headers.get('X-User-Id');
    }

    // Build query
    const where: Record<string, unknown> = {
      status: { equals: 'published' },
    };

    if (category) {
      where.category = { equals: category };
    }

    if (search) {
      where.or = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    // If enrolled filter and user is authenticated
    if (enrolled && userId) {
      const enrollments = await payload.find({
        collection: 'enrollments',
        where: {
          user: { equals: userId },
          status: { equals: 'active' },
        },
        limit: 1000,
      });

      const enrolledCourseIds = enrollments.docs.map((e) => {
        const course = e.course;
        return typeof course === 'object' ? course.id : course;
      });

      if (enrolledCourseIds.length > 0) {
        where.id = { in: enrolledCourseIds };
      } else {
        // No enrollments, return empty
        return NextResponse.json({
          courses: [],
          pagination: { page: 1, totalPages: 0, totalDocs: 0, hasNextPage: false },
        });
      }
    }

    const courses = await payload.find({
      collection: 'courses',
      where,
      page,
      limit,
      sort,
      depth: 1,
    });

    // Transform for mobile (minimal payload)
    const mobileCourses = courses.docs.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail
        ? { url: (course.thumbnail as { url: string }).url }
        : null,
      pricing: {
        amount: (course.pricing as Record<string, unknown>)?.amount || 0,
        currency: (course.pricing as Record<string, unknown>)?.currency || 'USD',
        isFree: (course.pricing as Record<string, unknown>)?.isFree || false,
      },
      stats: {
        enrollments: (course.stats as Record<string, unknown>)?.enrollments || 0,
        avgRating: (course.stats as Record<string, unknown>)?.avgRating || 0,
        totalDuration: (course.stats as Record<string, unknown>)?.totalDuration || 0,
        lessonCount: (course.stats as Record<string, unknown>)?.lessonCount || 0,
      },
      instructor: course.instructor
        ? {
            id: typeof course.instructor === 'object' ? course.instructor.id : course.instructor,
            name: typeof course.instructor === 'object' ? course.instructor.name : undefined,
          }
        : null,
      level: course.level,
      category: course.category,
    }));

    return NextResponse.json({
      courses: mobileCourses,
      pagination: {
        page: courses.page,
        totalPages: courses.totalPages,
        totalDocs: courses.totalDocs,
        hasNextPage: courses.hasNextPage,
        hasPrevPage: courses.hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Mobile courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

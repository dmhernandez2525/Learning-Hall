import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listCourseReviews, createReview, getReviewStats, getUserReviewForCourse } from '@/lib/reviews';
import { getCourseByIdOrSlug } from '@/lib/courses';

type RouteParams = { params: Promise<{ id: string }> };

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSession();

    // Get course by id or slug
    const course = await getCourseByIdOrSlug(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' || 'newest';
    const includeStats = searchParams.get('includeStats') === 'true';
    const includeUserReview = searchParams.get('includeUserReview') === 'true';

    const result = await listCourseReviews(
      course.id,
      { page, limit, sort },
      user?.id
    );

    const response: Record<string, unknown> = { ...result };

    if (includeStats) {
      response.stats = await getReviewStats(course.id);
    }

    if (includeUserReview && user) {
      response.userReview = await getUserReviewForCourse(course.id, user.id);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('List reviews error:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Get course by id or slug
    const course = await getCourseByIdOrSlug(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const review = await createReview(course.id, result.data, user);
    return NextResponse.json({ doc: review }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

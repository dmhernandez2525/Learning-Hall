import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getReview, updateReview } from '@/lib/reviews';
import { getPayloadClient } from '@/lib/payload';

type RouteParams = { params: Promise<{ id: string }> };

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  content: z.string().max(2000).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getSession();

    const review = await getReview(id, user?.id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ doc: review });
  } catch (error) {
    console.error('Get review error:', error);
    return NextResponse.json({ error: 'Failed to load review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const review = await updateReview(id, result.data, user);
    return NextResponse.json({ doc: review });
  } catch (error) {
    console.error('Update review error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update review';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const payload = await getPayloadClient();

    // Check ownership or admin
    const review = await payload.findByID({
      collection: 'course-reviews',
      id,
      depth: 0,
    });

    const ownerId = typeof review.user === 'object'
      ? String((review.user as Record<string, unknown>).id)
      : String(review.user);

    if (ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await payload.delete({
      collection: 'course-reviews',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}

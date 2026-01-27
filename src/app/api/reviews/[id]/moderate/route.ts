import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { moderateReview } from '@/lib/reviews';

type RouteParams = { params: Promise<{ id: string }> };

const moderateSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'instructor') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = moderateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const review = await moderateReview(id, result.data.status, user);
    return NextResponse.json({ doc: review });
  } catch (error) {
    console.error('Moderate review error:', error);
    const message = error instanceof Error ? error.message : 'Failed to moderate';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

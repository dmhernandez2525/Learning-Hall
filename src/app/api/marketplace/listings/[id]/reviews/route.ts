import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listReviewsForListing, addReview } from '@/lib/marketplace';

type RouteParams = { params: Promise<{ id: string }> };

const createSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const docs = await listReviewsForListing(id);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list reviews' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await addReview(id, parsed.data.rating, parsed.data.comment ?? '', user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add review' },
      { status: 400 }
    );
  }
}

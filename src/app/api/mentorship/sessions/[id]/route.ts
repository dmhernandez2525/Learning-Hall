import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { updateSession } from '@/lib/mentorship';

type RouteParams = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().max(5000).optional(),
  menteeRating: z.number().int().min(1).max(5).optional(),
  menteeFeedback: z.string().max(2000).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await updateSession(id, parsed.data);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update session' },
      { status: 400 }
    );
  }
}

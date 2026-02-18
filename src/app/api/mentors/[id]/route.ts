import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getMentorProfile, updateMentorProfile } from '@/lib/mentorship';

type RouteParams = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  bio: z.string().min(1).max(2000).optional(),
  expertise: z.array(z.string().min(1)).min(1).max(20).optional(),
  maxMentees: z.number().int().min(1).max(50).optional(),
  availableSlots: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().min(1),
        endTime: z.string().min(1),
      })
    )
    .optional(),
  status: z.enum(['active', 'paused', 'inactive']).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const doc = await getMentorProfile(id);
    if (!doc) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
    }
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load mentor profile' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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

    const doc = await updateMentorProfile(id, parsed.data);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update mentor profile' },
      { status: 400 }
    );
  }
}

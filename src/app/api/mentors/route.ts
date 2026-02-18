import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listMentors, createMentorProfile } from '@/lib/mentorship';

const createSchema = z.object({
  displayName: z.string().min(1).max(200),
  bio: z.string().min(1).max(2000),
  expertise: z.array(z.string().min(1)).min(1).max(20),
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
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const expertise = url.searchParams.get('expertise') ?? undefined;

    const docs = await listMentors({ status, expertise });
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list mentors' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await createMentorProfile(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create mentor profile' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listCohortsForCourse, createCohort } from '@/lib/cohorts';

type RouteParams = { params: Promise<{ id: string }> };

const dripItemSchema = z.object({
  moduleId: z.string().min(1),
  unlockDate: z.string().min(1),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  maxMembers: z.number().min(1).optional(),
  dripSchedule: z.array(dripItemSchema).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const docs = await listCohortsForCourse(courseId);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load cohorts' },
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

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: courseId } = await params;
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await createCohort({ ...parsed.data, courseId }, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create cohort' },
      { status: 400 }
    );
  }
}

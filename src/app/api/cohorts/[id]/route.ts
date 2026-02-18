import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getCohort } from '@/lib/cohorts';
import { getPayloadClient } from '@/lib/payload';
import { formatCohort } from '@/lib/cohorts';

type RouteParams = { params: Promise<{ id: string }> };

const dripItemSchema = z.object({
  moduleId: z.string().min(1),
  unlockDate: z.string().min(1),
});

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxMembers: z.number().min(1).optional(),
  status: z.enum(['active', 'upcoming', 'completed']).optional(),
  dripSchedule: z.array(dripItemSchema).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const doc = await getCohort(id);
    if (!doc) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load cohort' },
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

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.startDate !== undefined) updateData.startDate = parsed.data.startDate;
    if (parsed.data.endDate !== undefined) updateData.endDate = parsed.data.endDate;
    if (parsed.data.maxMembers !== undefined) updateData.maxMembers = parsed.data.maxMembers;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.dripSchedule !== undefined) {
      updateData.dripSchedule = parsed.data.dripSchedule.map((s) => ({
        moduleId: s.moduleId,
        unlockDate: s.unlockDate,
      }));
    }

    const payload = await getPayloadClient();
    const doc = await payload.update({ collection: 'cohorts', id, data: updateData });
    return NextResponse.json({ doc: formatCohort(doc as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update cohort' },
      { status: 400 }
    );
  }
}

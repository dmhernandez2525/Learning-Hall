import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getLearningPath, updateLearningPath } from '@/lib/learning-paths';

type RouteParams = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  estimatedHours: z.number().min(0).optional(),
  steps: z.array(z.object({
    stepId: z.string().min(1),
    courseId: z.string().min(1),
    order: z.number().min(0),
    isRequired: z.boolean().optional(),
    prerequisiteStepIds: z.array(z.string()).optional(),
  })).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const doc = await getLearningPath(id);
    if (!doc) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load path' },
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

    const doc = await updateLearningPath(id, parsed.data);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update path' },
      { status: 400 }
    );
  }
}

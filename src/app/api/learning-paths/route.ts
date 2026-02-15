import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listLearningPaths, createLearningPath } from '@/lib/learning-paths';

const stepSchema = z.object({
  stepId: z.string().min(1),
  courseId: z.string().min(1),
  order: z.number().min(0),
  isRequired: z.boolean().optional(),
  prerequisiteStepIds: z.array(z.string()).optional(),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  estimatedHours: z.number().min(0).optional(),
  steps: z.array(stepSchema).optional(),
});

export async function GET() {
  try {
    const docs = await listLearningPaths();
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load paths' },
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

    const doc = await createLearningPath(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create path' },
      { status: 400 }
    );
  }
}

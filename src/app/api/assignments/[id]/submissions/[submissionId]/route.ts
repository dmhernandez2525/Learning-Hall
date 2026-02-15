import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { gradeSubmission } from '@/lib/assignment-grading';

type RouteParams = { params: Promise<{ id: string; submissionId: string }> };

const gradeSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
  rubricScores: z.array(z.object({
    criterionId: z.string().min(1),
    score: z.number().min(0),
    comment: z.string().optional().default(''),
  })).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { submissionId } = await params;
    const body = await request.json();
    const parsed = gradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await gradeSubmission(submissionId, parsed.data, user);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to grade submission' },
      { status: 400 }
    );
  }
}

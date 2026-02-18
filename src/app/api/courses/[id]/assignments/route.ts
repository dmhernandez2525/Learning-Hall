import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listAssignmentsForCourse, createAssignment } from '@/lib/assignments';

type RouteParams = { params: Promise<{ id: string }> };

const rubricCriterionSchema = z.object({
  criterionId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  maxPoints: z.number().min(0),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  lessonId: z.string().optional(),
  dueDate: z.string().optional(),
  maxScore: z.number().min(1).optional(),
  allowLateSubmission: z.boolean().optional(),
  latePenaltyPercent: z.number().min(0).max(100).optional(),
  maxResubmissions: z.number().min(0).optional(),
  submissionTypes: z.array(z.enum(['text', 'file', 'url'])).optional(),
  rubric: z.array(rubricCriterionSchema).optional(),
  enablePeerReview: z.boolean().optional(),
  peerReviewsRequired: z.number().min(1).max(5).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const docs = await listAssignmentsForCourse(courseId);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load assignments' },
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

    const doc = await createAssignment({ ...parsed.data, courseId }, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create assignment' },
      { status: 400 }
    );
  }
}

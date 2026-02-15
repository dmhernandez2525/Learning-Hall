import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getAssignment } from '@/lib/assignments';
import { listSubmissions, createSubmission } from '@/lib/assignment-grading';

type RouteParams = { params: Promise<{ id: string }> };

const submitSchema = z.object({
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  linkUrl: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const assignment = await getAssignment(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    let docs = await listSubmissions(assignmentId);

    if (user.role !== 'admin' && user.role !== 'instructor') {
      docs = docs.filter((doc) => doc.studentId === user.id);
    }

    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load submissions' },
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

    const { id: assignmentId } = await params;
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await createSubmission(assignmentId, parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit assignment' },
      { status: 400 }
    );
  }
}

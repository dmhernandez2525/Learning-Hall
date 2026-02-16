import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listAssessments, createAssessment } from '@/lib/skills';

const createSchema = z.object({
  userId: z.string().min(1),
  skillId: z.string().min(1),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  targetLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  source: z.enum(['manual', 'course_completion', 'quiz', 'peer_review']).optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? undefined;
  const skillId = searchParams.get('skillId') ?? undefined;

  const docs = await listAssessments(userId, skillId);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const doc = await createAssessment(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create assessment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

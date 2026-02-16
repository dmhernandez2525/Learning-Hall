import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listAudits, createAudit } from '@/lib/accessibility';

const issueSchema = z.object({
  rule: z.string().min(1),
  severity: z.enum(['error', 'warning', 'info']),
  element: z.string(),
  description: z.string(),
  suggestion: z.string(),
});

const createSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  wcagLevel: z.enum(['A', 'AA', 'AAA']),
  score: z.number().min(0).max(100),
  issues: z.array(issueSchema),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') ?? undefined;
  const docs = await listAudits(courseId);
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
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createAudit(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create audit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

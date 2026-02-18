import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listSummaries, createSummary } from '@/lib/ai-content';

const createSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  originalLength: z.number().int().min(0),
  summary: z.string().min(1),
  keyPoints: z.array(z.string()).min(1).max(20),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId') ?? undefined;
  const docs = await listSummaries(lessonId);
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
    const doc = await createSummary(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create summary';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

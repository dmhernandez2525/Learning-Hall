import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listMicroLessons, createMicroLesson } from '@/lib/microlearning';

const createSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  durationMinutes: z.number().min(1),
  order: z.number().optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') ?? undefined;
  const docs = await listMicroLessons(courseId);
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
    const doc = await createMicroLesson(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create micro lesson';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

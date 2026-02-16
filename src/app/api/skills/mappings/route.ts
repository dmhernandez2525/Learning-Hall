import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listMappings, createMapping } from '@/lib/skills';

const createSchema = z.object({
  skillId: z.string().min(1),
  courseId: z.string().min(1),
  targetLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  weight: z.number().min(0).max(10).optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get('skillId') ?? undefined;
  const courseId = searchParams.get('courseId') ?? undefined;

  const docs = await listMappings(skillId, courseId);
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
    const doc = await createMapping(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create mapping';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

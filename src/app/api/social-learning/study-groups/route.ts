import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listStudyGroups, createStudyGroup } from '@/lib/social-learning';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  courseId: z.string().min(1),
  maxMembers: z.number().int().min(2).max(100).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') ?? undefined;
  const docs = await listStudyGroups(courseId);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createStudyGroup(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create study group';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

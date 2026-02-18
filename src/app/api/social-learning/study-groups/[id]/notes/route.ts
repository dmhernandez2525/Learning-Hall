import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listNotes, createNote } from '@/lib/social-learning';

type RouteParams = { params: Promise<{ id: string }> };

const createSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1),
});

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const docs = await listNotes(id);
  return NextResponse.json({ docs });
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createNote({ groupId: id, ...parsed.data }, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create note';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

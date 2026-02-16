import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listItems, createItem } from '@/lib/content-library';

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(3000).optional(),
  contentType: z.enum(['document', 'video', 'image', 'template', 'scorm']),
  organizationId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') ?? undefined;
  const contentType = searchParams.get('contentType') ?? undefined;

  const docs = await listItems(orgId, contentType);
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
    const doc = await createItem(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

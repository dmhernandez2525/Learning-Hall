import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listVersions, addVersion } from '@/lib/content-library';

type RouteParams = { params: Promise<{ id: string }> };

const createSchema = z.object({
  changelog: z.string().max(2000).optional(),
  fileUrl: z.string().min(1),
  fileSize: z.number().min(0).optional(),
});

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const docs = await listVersions(id);
  return NextResponse.json({ docs });
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const doc = await addVersion({ contentItemId: id, ...parsed.data }, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add version';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { toggleSSO } from '@/lib/security';

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  isEnabled: z.boolean(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await toggleSSO(id, parsed.data.isEnabled);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update SSO';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

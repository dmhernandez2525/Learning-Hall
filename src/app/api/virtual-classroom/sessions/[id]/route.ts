import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { updateSessionStatus } from '@/lib/virtual-classroom';

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await updateSessionStatus(id, parsed.data.status);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { markAsRead } from '@/lib/notifications';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const doc = await markAsRead(id);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

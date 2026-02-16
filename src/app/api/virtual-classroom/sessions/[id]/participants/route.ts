import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { joinSession, listParticipants } from '@/lib/virtual-classroom';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const docs = await listParticipants(id);
  return NextResponse.json({ docs });
}

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const doc = await joinSession(id, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getExecution } from '@/lib/reporting';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const doc = await getExecution(id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ doc });
}

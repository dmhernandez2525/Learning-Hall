import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listActivities } from '@/lib/community';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? undefined;
  const docs = await listActivities(userId);
  return NextResponse.json({ docs });
}

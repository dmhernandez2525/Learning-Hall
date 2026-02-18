import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getTeamProgress } from '@/lib/manager';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const docs = await getTeamProgress(user.id);
    return NextResponse.json({ docs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get team progress';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

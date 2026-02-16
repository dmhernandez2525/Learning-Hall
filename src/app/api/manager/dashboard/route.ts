import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getManagerDashboard } from '@/lib/manager';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const doc = await getManagerDashboard(user.id);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get dashboard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

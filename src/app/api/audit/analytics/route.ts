import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAuditAnalytics } from '@/lib/audit';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const doc = await getAuditAnalytics();
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

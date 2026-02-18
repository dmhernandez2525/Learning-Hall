import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getScheduledReports } from '@/lib/reporting';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const docs = await getScheduledReports();
  return NextResponse.json({ docs });
}

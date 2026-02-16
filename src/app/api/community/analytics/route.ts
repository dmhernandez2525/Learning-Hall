import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getCommunityAnalytics } from '@/lib/community';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await getCommunityAnalytics();
  return NextResponse.json({ doc });
}

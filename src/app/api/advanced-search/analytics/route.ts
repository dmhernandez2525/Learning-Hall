import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSearchAnalytics } from '@/lib/advanced-search';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await getSearchAnalytics();
  return NextResponse.json({ doc });
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getMicrolearningAnalytics } from '@/lib/microlearning';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await getMicrolearningAnalytics();
  return NextResponse.json({ doc });
}

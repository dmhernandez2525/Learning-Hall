import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSocialLearningAnalytics } from '@/lib/social-learning';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await getSocialLearningAnalytics();
  return NextResponse.json({ doc });
}

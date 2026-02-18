import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAIContentAnalytics } from '@/lib/ai-content';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await getAIContentAnalytics();
  return NextResponse.json({ doc });
}

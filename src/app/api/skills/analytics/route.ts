import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSkillsAnalytics } from '@/lib/skills';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const doc = await getSkillsAnalytics();
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getGapAnalysis } from '@/lib/skills';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? user.id;

  try {
    const gaps = await getGapAnalysis(userId);
    return NextResponse.json({ docs: gaps });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get gap analysis';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

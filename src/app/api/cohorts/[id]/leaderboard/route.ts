import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCohortLeaderboard } from '@/lib/cohorts';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const docs = await getCohortLeaderboard(id);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load leaderboard' },
      { status: 400 }
    );
  }
}

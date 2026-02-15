import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { joinCohort } from '@/lib/cohorts';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const doc = await joinCohort(id, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join cohort' },
      { status: 400 }
    );
  }
}

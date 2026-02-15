import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPathProgress } from '@/lib/learning-paths';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const doc = await getPathProgress(id, user.id);
    if (!doc) {
      return NextResponse.json({ error: 'Not enrolled in this path' }, { status: 404 });
    }
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load progress' },
      { status: 400 }
    );
  }
}

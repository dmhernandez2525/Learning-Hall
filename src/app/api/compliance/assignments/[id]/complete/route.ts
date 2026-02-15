import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { completeAssignment } from '@/lib/compliance';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const doc = await completeAssignment(id);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete assignment' },
      { status: 400 }
    );
  }
}

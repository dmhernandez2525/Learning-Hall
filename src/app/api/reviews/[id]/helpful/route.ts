import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { voteReviewHelpful } from '@/lib/reviews';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const review = await voteReviewHelpful(id, user);

    return NextResponse.json({ doc: review });
  } catch (error) {
    console.error('Vote helpful error:', error);
    const message = error instanceof Error ? error.message : 'Failed to vote';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

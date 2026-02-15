import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMentorAnalytics } from '@/lib/mentorship';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(request.url);
    const mentorUserId = url.searchParams.get('mentorUserId') ?? user.id;

    const doc = await getMentorAnalytics(mentorUserId);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load analytics' },
      { status: 400 }
    );
  }
}

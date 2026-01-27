import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listLessonBookmarks } from '@/lib/bookmarks';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const bookmarks = await listLessonBookmarks(user, limit);
    return NextResponse.json({ docs: bookmarks });
  } catch (error) {
    console.error('List bookmarks error', error);
    return NextResponse.json({ error: 'Failed to load bookmarks' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { setLessonBookmark } from '@/lib/bookmarks';

type RouteParams = { params: Promise<{ lessonId: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { lessonId } = await params;
    await setLessonBookmark(lessonId, true, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bookmark lesson error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to bookmark lesson' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { lessonId } = await params;
    await setLessonBookmark(lessonId, false, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove bookmark error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to remove bookmark' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteVideoBookmark } from '@/lib/bookmarks';

type RouteParams = {
  params: Promise<{ id: string; bookmarkId: string }>;
};

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: lessonId, bookmarkId } = await params;
    await deleteVideoBookmark(lessonId, bookmarkId, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete bookmark' },
      { status: 400 }
    );
  }
}

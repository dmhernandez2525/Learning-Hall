import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { setCourseFavorite } from '@/lib/favorites';

type RouteParams = { params: Promise<{ courseId: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { courseId } = await params;
    await setCourseFavorite(courseId, true, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite course error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to favorite course' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { courseId } = await params;
    await setCourseFavorite(courseId, false, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unfavorite course error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to unfavorite course' }, { status: 400 });
  }
}

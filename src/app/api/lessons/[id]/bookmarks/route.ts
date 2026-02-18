import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import {
  createVideoBookmark,
  listVideoBookmarksForLesson,
} from '@/lib/bookmarks';

type RouteParams = { params: Promise<{ id: string }> };

const createBookmarkSchema = z.object({
  timestamp: z.number().min(0),
  note: z.string().max(500).optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const docs = await listVideoBookmarksForLesson(lessonId, user);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load bookmarks' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await request.json();
    const parsed = createBookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await createVideoBookmark(
      lessonId,
      parsed.data.timestamp,
      parsed.data.note,
      user
    );
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bookmark' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getLessonNote, updateLessonNote, deleteLessonNote } from '@/lib/notes';

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  contentHtml: z.string().min(1).optional(),
  videoTimestamp: z.number().min(0).nullable().optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const note = await getLessonNote(id, user);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ doc: note });
  } catch (error) {
    console.error('Get note error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load note' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const note = await updateLessonNote(id, result.data, user);
    return NextResponse.json({ doc: note });
  } catch (error) {
    console.error('Update note error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update note' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    await deleteLessonNote(id, user);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete note error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete note' }, { status: 400 });
  }
}

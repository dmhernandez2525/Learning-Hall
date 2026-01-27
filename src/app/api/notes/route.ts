import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listLessonNotes, createLessonNote } from '@/lib/notes';

const listSchema = z.object({
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const createSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1),
  contentHtml: z.string().min(1),
  videoTimestamp: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const params = listSchema.safeParse({
      courseId: request.nextUrl.searchParams.get('courseId') || undefined,
      lessonId: request.nextUrl.searchParams.get('lessonId') || undefined,
      search: request.nextUrl.searchParams.get('search') || undefined,
      page: request.nextUrl.searchParams.get('page') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined,
    });

    if (!params.success) {
      return NextResponse.json({ error: 'Validation failed', details: params.error.flatten() }, { status: 400 });
    }

    const notes = await listLessonNotes(params.data, user);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('List notes error', error);
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const note = await createLessonNote(result.data, user);
    return NextResponse.json({ doc: note }, { status: 201 });
  } catch (error) {
    console.error('Create note error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create note' }, { status: 400 });
  }
}

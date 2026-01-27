import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listDiscussionThreads, createDiscussionThread } from '@/lib/discussions';
import type { CreateThreadInput } from '@/lib/discussions';

const createThreadSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(5),
  body: z.any(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;

    const threads = await listDiscussionThreads({ courseId, page, limit, search }, user);
    return NextResponse.json(threads);
  } catch (error) {
    console.error('List discussions error', error);
    return NextResponse.json({ error: 'Failed to load discussions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = createThreadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const thread = await createDiscussionThread(result.data as CreateThreadInput, user);
    return NextResponse.json({ doc: thread }, { status: 201 });
  } catch (error) {
    console.error('Create discussion error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create discussion' }, { status: 400 });
  }
}

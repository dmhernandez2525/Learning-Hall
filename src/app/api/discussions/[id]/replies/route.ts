import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { createDiscussionPost, listDiscussionPosts } from '@/lib/discussions';
import type { CreatePostInput } from '@/lib/discussions';

type RouteParams = { params: Promise<{ id: string }> };

const replySchema = z.object({
  parentId: z.string().optional(),
  content: z.any(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { id } = await params;
    const replies = await listDiscussionPosts(id, user);
    return NextResponse.json({ docs: replies });
  } catch (error) {
    console.error('List replies error', error);
    return NextResponse.json({ error: 'Failed to load replies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = replySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const post = await createDiscussionPost(
      { threadId: id, parentId: result.data.parentId, content: result.data.content } as CreatePostInput,
      user
    );
    return NextResponse.json({ doc: post }, { status: 201 });
  } catch (error) {
    console.error('Create reply error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create reply' }, { status: 400 });
  }
}

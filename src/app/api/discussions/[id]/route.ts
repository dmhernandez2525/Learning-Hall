import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import {
  getDiscussionThread,
  listDiscussionPosts,
  pinDiscussionThread,
  DiscussionThread,
} from '@/lib/discussions';
import { getPayloadClient } from '@/lib/payload';
import { getCourse } from '@/lib/courses';

type RouteParams = { params: Promise<{ id: string }> };

const statusSchema = z.object({
  status: z.enum(['open', 'closed']),
});

const pinSchema = z.object({
  isPinned: z.boolean(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const thread = await getDiscussionThread(id, user);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const posts = await listDiscussionPosts(id, user);
    return NextResponse.json({ doc: thread, replies: posts });
  } catch (error) {
    console.error('Get discussion thread error', error);
    return NextResponse.json({ error: 'Failed to load thread' }, { status: 500 });
  }
}

async function ensureInstructor(user: Awaited<ReturnType<typeof getSession>>, thread: DiscussionThread) {
  if (!user) throw new Error('Authentication required');
  if (user.role === 'admin') return;
  if (user.role !== 'instructor') {
    throw new Error('Only instructors can perform this action');
  }
  const course = await getCourse(thread.courseId);
  if (course?.instructor?.id !== user.id) {
    throw new Error('Only the course instructor can perform this action');
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const thread = await getDiscussionThread(id, user);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const payload = await request.json();
    if ('isPinned' in payload) {
      const parsed = pinSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
      }
      await ensureInstructor(user, thread);
      const updated = await pinDiscussionThread(id, parsed.data.isPinned, user);
      return NextResponse.json({ doc: updated });
    }

    if ('status' in payload) {
      const parsed = statusSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
      }
      if (!['admin', 'instructor'].includes(user.role) && thread.author.id !== user.id) {
        return NextResponse.json({ error: 'Not authorized to update status' }, { status: 403 });
      }
      const payloadClient = await getPayloadClient();
      await payloadClient.update({
        collection: 'discussion-threads',
        id,
        data: { status: parsed.data.status },
      });
      const refreshed = await getDiscussionThread(id, user);
      return NextResponse.json({ doc: refreshed });
    }

    return NextResponse.json({ error: 'Unsupported update' }, { status: 400 });
  } catch (error) {
    console.error('Update discussion thread error', error);
    const message = error instanceof Error ? error.message : 'Failed to update thread';
    const status = message === 'Only instructors can perform this action' ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

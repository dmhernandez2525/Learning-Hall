import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { markPostAsAnswer, unmarkAnswer } from '@/lib/discussions';

type RouteParams = { params: Promise<{ id: string; replyId: string }> };

const answerSchema = z.object({
  action: z.enum(['mark-answer', 'unmark-answer']),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id, replyId } = await params;
    const body = await request.json();
    const result = answerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    if (result.data.action === 'mark-answer') {
      const payload = await markPostAsAnswer(id, replyId, user);
      return NextResponse.json(payload);
    }

    const thread = await unmarkAnswer(id, user);
    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Answer toggle error', error);
    const message = error instanceof Error ? error.message : 'Failed to update answer';
    const status = message.includes('instructor') ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

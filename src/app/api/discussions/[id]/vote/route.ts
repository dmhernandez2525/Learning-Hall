import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { voteOnThread } from '@/lib/discussions';

type RouteParams = { params: Promise<{ id: string }> };

const voteSchema = z.object({
  value: z.number().int().refine((val) => [-1, 0, 1].includes(val), {
    message: 'value must be -1, 0, or 1',
  }),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = voteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const score = await voteOnThread(id, result.data.value as -1 | 0 | 1, user);
    return NextResponse.json({ voteScore: score });
  } catch (error) {
    console.error('Thread vote error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to vote' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { addInstructorResponse } from '@/lib/reviews';

type RouteParams = { params: Promise<{ id: string }> };

const respondSchema = z.object({
  response: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = respondSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const review = await addInstructorResponse(id, result.data.response, user);
    return NextResponse.json({ doc: review });
  } catch (error) {
    console.error('Respond to review error:', error);
    const message = error instanceof Error ? error.message : 'Failed to respond';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

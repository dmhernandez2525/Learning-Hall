import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { updateLessonActivity } from '@/lib/activity';

type RouteParams = { params: Promise<{ lessonId: string }> };

const schema = z.object({
  position: z.number().min(0).optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { lessonId } = await params;
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const entry = await updateLessonActivity(lessonId, result.data.position, user);
    return NextResponse.json({ doc: entry });
  } catch (error) {
    console.error('Update activity error', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update activity' }, { status: 400 });
  }
}

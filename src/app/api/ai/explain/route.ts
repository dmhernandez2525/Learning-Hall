import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { explain, summarize } from '@/lib/ai';
import { z } from 'zod';

const explainSchema = z.object({
  type: z.enum(['explain', 'summarize']),
  content: z.string().min(1).max(10000),
  context: z
    .object({
      courseId: z.string().optional(),
      lessonId: z.string().optional(),
    })
    .optional(),
  maxLength: z.number().min(100).max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = explainSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, content, context, maxLength } = parsed.data;

    if (type === 'explain') {
      const explanation = await explain(content, context);
      return NextResponse.json({ explanation });
    }

    if (type === 'summarize') {
      const summary = await summarize(content, maxLength || 500);
      return NextResponse.json({ summary });
    }

    return NextResponse.json(
      { error: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('AI explain error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Explanation failed' },
      { status: 500 }
    );
  }
}

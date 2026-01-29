import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateSuggestions, generateHint } from '@/lib/ai';
import { z } from 'zod';

const suggestSchema = z.object({
  type: z.enum(['questions', 'hint']),
  lessonId: z.string().optional(),
  questionText: z.string().optional(),
  options: z.array(z.string()).optional(),
  count: z.number().min(1).max(5).optional(),
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
    const parsed = suggestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, lessonId, questionText, options, count } = parsed.data;

    if (type === 'questions') {
      if (!lessonId) {
        return NextResponse.json(
          { error: 'lessonId is required for question suggestions' },
          { status: 400 }
        );
      }

      const suggestions = await generateSuggestions(lessonId, count || 3);
      return NextResponse.json({ suggestions });
    }

    if (type === 'hint') {
      if (!questionText) {
        return NextResponse.json(
          { error: 'questionText is required for hints' },
          { status: 400 }
        );
      }

      const hint = await generateHint(questionText, options);
      return NextResponse.json({ hint });
    }

    return NextResponse.json(
      { error: 'Invalid suggestion type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('AI suggest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Suggestion failed' },
      { status: 500 }
    );
  }
}

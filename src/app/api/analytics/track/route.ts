import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { trackClientEvent } from '@/lib/advanced-analytics';
import { z } from 'zod';

const trackSchema = z.object({
  eventType: z.string().min(1),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  quizId: z.string().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  properties: z
    .object({
      duration: z.number().optional(),
      progress: z.number().min(0).max(100).optional(),
      score: z.number().optional(),
      value: z.number().optional(),
      query: z.string().optional(),
      errorMessage: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    const body = await request.json();
    const parsed = trackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid event data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { eventType, courseId, lessonId, quizId, sessionId, metadata, properties } =
      parsed.data;

    await trackClientEvent(request, eventType, {
      userId: user?.id,
      sessionId,
      courseId,
      lessonId,
      quizId,
      tenantId: user?.tenant as string | undefined,
      metadata,
      properties,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    // Always return success to not block client
    return NextResponse.json({ success: true });
  }
}

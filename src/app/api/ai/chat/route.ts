import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { chat, saveConversation, updateConversation } from '@/lib/ai';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  context: z
    .object({
      courseId: z.string().optional(),
      lessonId: z.string().optional(),
      quizId: z.string().optional(),
    })
    .optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'ollama']).optional(),
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
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, conversationId, context, provider = 'openai' } = parsed.data;
    const payload = await getPayload({ config });

    // Build context information
    let contextInfo: {
      courseId?: string;
      lessonId?: string;
      quizId?: string;
      courseTitle?: string;
      lessonTitle?: string;
      lessonContent?: string;
    } = {};

    if (context?.lessonId) {
      const lesson = await payload.findByID({
        collection: 'lessons',
        id: context.lessonId,
        depth: 1,
      });
      if (lesson) {
        contextInfo = {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonContent: typeof lesson.content === 'string' ? lesson.content : '',
        };
        const moduleData = lesson.module as { course?: { id: string; title: string } | string } | undefined;
        if (moduleData && typeof moduleData.course === 'object') {
          contextInfo.courseId = moduleData.course.id;
          contextInfo.courseTitle = moduleData.course.title;
        }
      }
    } else if (context?.courseId) {
      const course = await payload.findByID({
        collection: 'courses',
        id: context.courseId,
      });
      if (course) {
        contextInfo = {
          courseId: course.id,
          courseTitle: course.title,
        };
      }
    }

    if (context?.quizId) {
      contextInfo.quizId = context.quizId;
    }

    // Get previous messages if continuing a conversation
    let previousMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (conversationId) {
      const existingConversation = await payload.findByID({
        collection: 'ai-conversations',
        id: conversationId,
      });

      if (existingConversation && existingConversation.user === user.id) {
        const msgs = existingConversation.messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }> || [];
        previousMessages = msgs.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }
    }

    // Build full message history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      ...previousMessages,
      { role: 'user', content: message },
    ];

    // Call AI
    const aiResponse = await chat(messages, provider, contextInfo);

    // Add assistant response to messages
    const newMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse.content },
    ];

    // Save or update conversation
    let savedConversationId = conversationId;

    if (conversationId) {
      await updateConversation(conversationId, newMessages, aiResponse.usage);
    } else {
      savedConversationId = await saveConversation(
        user.id,
        [...previousMessages, ...newMessages],
        provider,
        aiResponse.usage,
        contextInfo
      );
    }

    return NextResponse.json({
      success: true,
      response: aiResponse.content,
      conversationId: savedConversationId,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI chat failed' },
      { status: 500 }
    );
  }
}

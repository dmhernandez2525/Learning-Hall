import { getPayload } from 'payload';
import config from '@/payload.config';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
  tokensUsed?: number;
}

export interface ConversationContext {
  courseId?: string;
  lessonId?: string;
  quizId?: string;
}

export interface AIConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
}

// Provider-specific configurations
const PROVIDER_CONFIGS: Record<AIProvider, { defaultModel: string; costPer1kTokens: number }> = {
  openai: { defaultModel: 'gpt-4-turbo-preview', costPer1kTokens: 0.01 },
  anthropic: { defaultModel: 'claude-3-sonnet-20240229', costPer1kTokens: 0.003 },
  google: { defaultModel: 'gemini-pro', costPer1kTokens: 0.0005 },
  ollama: { defaultModel: 'llama2', costPer1kTokens: 0 },
};

/**
 * Create a new AI conversation
 */
export async function createConversation(
  userId: string,
  context: ConversationContext,
  provider: AIProvider = 'openai',
  tenantId?: string
) {
  const payload = await getPayload({ config });

  const conversation = await payload.create({
    collection: 'ai-conversations',
    data: {
      user: userId,
      context: {
        course: context.courseId,
        lesson: context.lessonId,
        quiz: context.quizId,
      },
      provider,
      model: PROVIDER_CONFIGS[provider].defaultModel,
      messages: [],
      usage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        estimatedCost: 0,
      },
      status: 'active',
      tenant: tenantId,
    },
  });

  return conversation;
}

/**
 * Send a message to the AI assistant
 */
export async function sendMessage(
  conversationId: string | number,
  userMessage: string,
  aiConfig?: Partial<AIConfig>
): Promise<ChatResponse> {
  const payload = await getPayload({ config });

  const conversation = await payload.findByID({
    collection: 'ai-conversations',
    id: conversationId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const provider = (conversation.provider as AIProvider) || 'openai';
  const model = aiConfig?.model || PROVIDER_CONFIGS[provider].defaultModel;

  // Build system prompt based on context
  const systemPrompt = await buildSystemPrompt(conversation.context);

  // Get existing messages
  const existingMessages = (conversation.messages as Message[]) || [];

  // Prepare messages for API call
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  // Call AI provider
  const response = await callAIProvider(provider, model, messages, aiConfig);

  // Update conversation with new messages
  const updatedMessages = [
    ...existingMessages,
    {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString(),
    },
    {
      role: 'assistant' as const,
      content: response.content,
      timestamp: new Date().toISOString(),
      tokensUsed: response.tokensUsed.completion,
    },
  ];

  const previousUsage = conversation.usage || {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    estimatedCost: 0,
  };

  const costPer1k = PROVIDER_CONFIGS[provider].costPer1kTokens;
  const newCost = (response.tokensUsed.total / 1000) * costPer1k * 100; // in cents

  await payload.update({
    collection: 'ai-conversations',
    id: conversationId,
    data: {
      messages: updatedMessages,
      model: response.model,
      usage: {
        totalTokens: (previousUsage.totalTokens || 0) + response.tokensUsed.total,
        promptTokens: (previousUsage.promptTokens || 0) + response.tokensUsed.prompt,
        completionTokens: (previousUsage.completionTokens || 0) + response.tokensUsed.completion,
        estimatedCost: (previousUsage.estimatedCost || 0) + newCost,
      },
    },
  });

  // Generate title if this is the first exchange
  if (existingMessages.length === 0) {
    await generateTitle(conversationId, userMessage, response.content);
  }

  return response;
}

/**
 * Build system prompt based on conversation context
 */
async function buildSystemPrompt(context: ConversationContext | null): Promise<string> {
  const payload = await getPayload({ config });

  let systemPrompt = `You are an AI learning assistant for an online education platform. Your role is to help students understand course material, answer questions, and provide explanations. Be helpful, encouraging, and educational.`;

  if (!context) return systemPrompt;

  // Add course context
  if (context.courseId) {
    try {
      const course = await payload.findByID({
        collection: 'courses',
        id: context.courseId,
      });

      if (course) {
        systemPrompt += `\n\nThe student is currently studying the course: "${course.title}".`;
        if (course.description) {
          systemPrompt += ` Course description: ${course.description}`;
        }
      }
    } catch {
      // Course not found, continue without context
    }
  }

  // Add lesson context
  if (context.lessonId) {
    try {
      const lesson = await payload.findByID({
        collection: 'lessons',
        id: context.lessonId,
      });

      if (lesson) {
        systemPrompt += `\n\nThe student is currently viewing the lesson: "${lesson.title}".`;
      }
    } catch {
      // Lesson not found, continue without context
    }
  }

  // Add quiz context
  if (context.quizId) {
    try {
      const quiz = await payload.findByID({
        collection: 'quizzes',
        id: context.quizId,
      });

      if (quiz) {
        systemPrompt += `\n\nThe student is working on the quiz: "${quiz.title}". Help them understand the concepts but don't give away answers directly.`;
      }
    } catch {
      // Quiz not found, continue without context
    }
  }

  return systemPrompt;
}

/**
 * Call AI provider API
 */
async function callAIProvider(
  provider: AIProvider,
  model: string,
  messages: Message[],
  aiConfig?: Partial<AIConfig>
): Promise<ChatResponse> {
  switch (provider) {
    case 'openai':
      return callOpenAI(model, messages, aiConfig);
    case 'anthropic':
      return callAnthropic(model, messages, aiConfig);
    case 'google':
      return callGoogle(model, messages, aiConfig);
    case 'ollama':
      return callOllama(model, messages, aiConfig);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  model: string,
  messages: Message[],
  aiConfig?: Partial<AIConfig>
): Promise<ChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: aiConfig?.temperature ?? 0.7,
      max_tokens: aiConfig?.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    tokensUsed: {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens,
    },
    model: data.model,
  };
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  model: string,
  messages: Message[],
  aiConfig?: Partial<AIConfig>
): Promise<ChatResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Extract system message
  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemMessage,
      messages: chatMessages,
      max_tokens: aiConfig?.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    tokensUsed: {
      prompt: data.usage.input_tokens,
      completion: data.usage.output_tokens,
      total: data.usage.input_tokens + data.usage.output_tokens,
    },
    model: data.model,
  };
}

/**
 * Call Google Gemini API
 */
async function callGoogle(
  model: string,
  messages: Message[],
  aiConfig?: Partial<AIConfig>
): Promise<ChatResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  // Convert messages to Gemini format
  const parts = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: parts,
        generationConfig: {
          temperature: aiConfig?.temperature ?? 0.7,
          maxOutputTokens: aiConfig?.maxTokens ?? 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error: ${error}`);
  }

  const data = await response.json();

  // Estimate tokens (Google doesn't always return token counts)
  const promptTokens = messages.reduce((sum, m) => sum + m.content.length / 4, 0);
  const completionTokens = (data.candidates[0]?.content?.parts[0]?.text?.length || 0) / 4;

  return {
    content: data.candidates[0]?.content?.parts[0]?.text || '',
    tokensUsed: {
      prompt: Math.round(promptTokens),
      completion: Math.round(completionTokens),
      total: Math.round(promptTokens + completionTokens),
    },
    model,
  };
}

/**
 * Call Ollama (local) API
 */
async function callOllama(
  model: string,
  messages: Message[],
  aiConfig?: Partial<AIConfig>
): Promise<ChatResponse> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: aiConfig?.temperature ?? 0.7,
        num_predict: aiConfig?.maxTokens ?? 1024,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.message?.content || '',
    tokensUsed: {
      prompt: data.prompt_eval_count || 0,
      completion: data.eval_count || 0,
      total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
    },
    model,
  };
}

/**
 * Generate a title for the conversation
 */
async function generateTitle(
  conversationId: string | number,
  userMessage: string,
  _assistantResponse: string
) {
  const payload = await getPayload({ config });

  // Simple title generation: take first 50 chars of user's first message
  let title = userMessage.slice(0, 50);
  if (userMessage.length > 50) {
    title += '...';
  }

  await payload.update({
    collection: 'ai-conversations',
    id: conversationId,
    data: { title },
  });
}

/**
 * Get conversation history
 */
export async function getConversation(conversationId: string | number) {
  const payload = await getPayload({ config });

  const conversation = await payload.findByID({
    collection: 'ai-conversations',
    id: conversationId,
  });

  return conversation;
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string, limit = 20) {
  const payload = await getPayload({ config });

  const conversations = await payload.find({
    collection: 'ai-conversations',
    where: {
      and: [{ user: { equals: userId } }, { status: { equals: 'active' } }],
    },
    sort: '-updatedAt',
    limit,
  });

  return conversations.docs;
}

/**
 * Archive a conversation
 */
export async function archiveConversation(conversationId: string | number, userId: string) {
  const payload = await getPayload({ config });

  const conversation = await payload.findByID({
    collection: 'ai-conversations',
    id: conversationId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.user !== userId) {
    throw new Error('Not authorized');
  }

  await payload.update({
    collection: 'ai-conversations',
    id: conversationId,
    data: { status: 'archived' },
  });
}

/**
 * Submit feedback for a conversation
 */
export async function submitFeedback(
  conversationId: string | number,
  userId: string,
  feedback: { helpful?: boolean; rating?: number; comment?: string }
) {
  const payload = await getPayload({ config });

  const conversation = await payload.findByID({
    collection: 'ai-conversations',
    id: conversationId,
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.user !== userId) {
    throw new Error('Not authorized');
  }

  await payload.update({
    collection: 'ai-conversations',
    id: conversationId,
    data: {
      feedback: {
        helpful: feedback.helpful,
        rating: feedback.rating,
        comment: feedback.comment,
      },
    },
  });
}

/**
 * Get AI usage statistics for a tenant
 */
export async function getAIUsageStats(tenantId: string, period: 'day' | 'week' | 'month' = 'month') {
  const payload = await getPayload({ config });

  const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const conversations = await payload.find({
    collection: 'ai-conversations',
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { createdAt: { greater_than: startDate.toISOString() } },
      ],
    },
    limit: 10000,
  });

  const stats = {
    totalConversations: conversations.docs.length,
    totalTokens: 0,
    totalCost: 0,
    byProvider: {} as Record<string, { count: number; tokens: number; cost: number }>,
  };

  for (const conv of conversations.docs) {
    const usage = conv.usage || { totalTokens: 0, estimatedCost: 0 };
    stats.totalTokens += usage.totalTokens || 0;
    stats.totalCost += usage.estimatedCost || 0;

    const provider = (conv.provider as string) || 'unknown';
    if (!stats.byProvider[provider]) {
      stats.byProvider[provider] = { count: 0, tokens: 0, cost: 0 };
    }
    stats.byProvider[provider].count += 1;
    stats.byProvider[provider].tokens += usage.totalTokens || 0;
    stats.byProvider[provider].cost += usage.estimatedCost || 0;
  }

  return stats;
}

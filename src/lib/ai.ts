import { getPayload } from 'payload';
import config from '@/payload.config';

// AI Provider types
type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

interface ConversationContext {
  courseId?: string;
  lessonId?: string;
  quizId?: string;
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
}

// Default system prompts for different contexts
const SYSTEM_PROMPTS = {
  general: `You are Learning Hall AI, a helpful and knowledgeable learning assistant. Your role is to:
- Help students understand course material
- Answer questions clearly and concisely
- Provide examples and explanations
- Encourage deeper understanding
- Be supportive and patient

Keep responses focused and educational. Use markdown formatting when helpful.`,

  course: (title: string) => `You are Learning Hall AI, an expert tutor for the course "${title}".
Help students:
- Understand course concepts
- Connect ideas across lessons
- Prepare for assessments
- Apply knowledge practically

Be encouraging and provide clear explanations. Use examples relevant to the course material.`,

  lesson: (title: string, content?: string) => `You are Learning Hall AI, helping a student with the lesson "${title}".
${content ? `\nLesson content summary:\n${content.slice(0, 2000)}...\n` : ''}
Help the student:
- Understand the lesson concepts
- Clarify confusing points
- Provide additional examples
- Connect to broader course themes

Focus on the lesson material but help students see the bigger picture.`,

  quiz: `You are Learning Hall AI, helping a student prepare for a quiz.
Your role:
- Explain concepts without giving direct answers
- Help students understand their mistakes
- Guide them toward correct thinking
- Provide study tips and memory aids

Never give away quiz answers directly. Instead, help students understand the underlying concepts.`,
};

// Get API key for provider
function getAPIKey(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY || '';
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || '';
    case 'google':
      return process.env.GOOGLE_AI_API_KEY || '';
    case 'ollama':
      return ''; // Ollama is local, no key needed
    default:
      return '';
  }
}

// Call OpenAI API
async function callOpenAI(messages: AIMessage[], model = 'gpt-4o-mini'): Promise<AIResponse> {
  const apiKey = getAPIKey('openai');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
    model: data.model,
  };
}

// Call Anthropic API
async function callAnthropic(messages: AIMessage[], model = 'claude-3-haiku-20240307'): Promise<AIResponse> {
  const apiKey = getAPIKey('anthropic');
  if (!apiKey) throw new Error('Anthropic API key not configured');

  // Extract system message
  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemMessage,
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    model: data.model,
  };
}

// Main chat function
export async function chat(
  messages: AIMessage[],
  provider: AIProvider = 'openai',
  context?: ConversationContext
): Promise<AIResponse> {
  // Build system prompt based on context
  let systemPrompt = SYSTEM_PROMPTS.general;

  if (context?.lessonId && context.lessonTitle) {
    systemPrompt = SYSTEM_PROMPTS.lesson(context.lessonTitle, context.lessonContent);
  } else if (context?.quizId) {
    systemPrompt = SYSTEM_PROMPTS.quiz;
  } else if (context?.courseId && context.courseTitle) {
    systemPrompt = SYSTEM_PROMPTS.course(context.courseTitle);
  }

  // Ensure system message is first
  const hasSystemMessage = messages.some((m) => m.role === 'system');
  const fullMessages: AIMessage[] = hasSystemMessage
    ? messages
    : [{ role: 'system', content: systemPrompt }, ...messages];

  switch (provider) {
    case 'openai':
      return callOpenAI(fullMessages);
    case 'anthropic':
      return callAnthropic(fullMessages);
    default:
      throw new Error(`Provider ${provider} not yet implemented`);
  }
}

// Generate suggestions based on lesson content
export async function generateSuggestions(
  lessonId: string,
  count = 3
): Promise<string[]> {
  const payload = await getPayload({ config });

  const lesson = await payload.findByID({
    collection: 'lessons',
    id: lessonId,
    depth: 1,
  });

  if (!lesson) throw new Error('Lesson not found');

  const prompt = `Based on this lesson content, generate ${count} insightful questions a student might ask to deepen their understanding.

Lesson: ${lesson.title}
${lesson.content ? `Content: ${String(lesson.content).slice(0, 1500)}` : ''}

Generate exactly ${count} questions, one per line. Questions should:
- Be specific to the lesson content
- Encourage deeper thinking
- Not have obvious yes/no answers

Output only the questions, one per line, no numbering or bullets.`;

  const response = await chat([{ role: 'user', content: prompt }], 'openai');

  return response.content
    .split('\n')
    .map((q) => q.trim())
    .filter((q) => q.length > 0)
    .slice(0, count);
}

// Explain a concept
export async function explain(
  concept: string,
  context?: ConversationContext
): Promise<string> {
  const prompt = `Please explain the following concept in a clear, educational way:

${concept}

Provide:
1. A simple explanation
2. A real-world example or analogy
3. Key points to remember

Keep the explanation concise but thorough.`;

  const response = await chat([{ role: 'user', content: prompt }], 'openai', context);
  return response.content;
}

// Summarize content
export async function summarize(content: string, maxLength = 500): Promise<string> {
  const prompt = `Summarize the following content in ${maxLength} words or less. Focus on the key concepts and main takeaways:

${content}`;

  const response = await chat([{ role: 'user', content: prompt }], 'openai');
  return response.content;
}

// Generate quiz hints
export async function generateHint(
  questionText: string,
  options?: string[]
): Promise<string> {
  const prompt = `A student is struggling with this quiz question. Provide a helpful hint WITHOUT giving away the answer:

Question: ${questionText}
${options ? `Options: ${options.join(', ')}` : ''}

Give a hint that:
- Points them in the right direction
- Helps them recall relevant concepts
- Does NOT reveal the answer directly`;

  const response = await chat([{ role: 'user', content: prompt }], 'openai');
  return response.content;
}

// Save conversation to database
export async function saveConversation(
  userId: string,
  messages: AIMessage[],
  provider: AIProvider,
  usage: AIResponse['usage'],
  context?: ConversationContext
): Promise<string> {
  const payload = await getPayload({ config });

  // Generate a title from the first user message
  const firstUserMessage = messages.find((m) => m.role === 'user');
  const title = firstUserMessage?.content.slice(0, 50) + '...' || 'New Conversation';

  const conversation = await payload.create({
    collection: 'ai-conversations',
    data: {
      user: userId,
      context: {
        course: context?.courseId,
        lesson: context?.lessonId,
        quiz: context?.quizId,
      },
      title,
      provider,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      })),
      usage: {
        totalTokens: usage.totalTokens,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
      },
      status: 'active',
    },
  });

  return conversation.id;
}

// Update existing conversation
export async function updateConversation(
  conversationId: string,
  newMessages: AIMessage[],
  usage: AIResponse['usage']
): Promise<void> {
  const payload = await getPayload({ config });

  const existing = await payload.findByID({
    collection: 'ai-conversations',
    id: conversationId,
  });

  if (!existing) throw new Error('Conversation not found');

  const existingMessages = (existing.messages as Array<{ role: string; content: string; timestamp: string }>) || [];
  const existingUsage = (existing.usage as { totalTokens?: number; promptTokens?: number; completionTokens?: number }) || {};

  await payload.update({
    collection: 'ai-conversations',
    id: conversationId,
    data: {
      messages: [
        ...existingMessages,
        ...newMessages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
        })),
      ],
      usage: {
        totalTokens: (existingUsage.totalTokens || 0) + usage.totalTokens,
        promptTokens: (existingUsage.promptTokens || 0) + usage.promptTokens,
        completionTokens: (existingUsage.completionTokens || 0) + usage.completionTokens,
      },
    },
  });
}

// Get user's conversation history
export async function getConversations(
  userId: string,
  options?: { courseId?: string; limit?: number }
): Promise<Array<{
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  messageCount: number;
}>> {
  const payload = await getPayload({ config });

  const where: Record<string, unknown> = {
    user: { equals: userId },
    status: { equals: 'active' },
  };

  if (options?.courseId) {
    where['context.course'] = { equals: options.courseId };
  }

  const conversations = await payload.find({
    collection: 'ai-conversations',
    where,
    limit: options?.limit || 20,
    sort: '-createdAt',
  });

  return conversations.docs.map((conv) => {
    const messages = (conv.messages as Array<{ content: string }>) || [];
    const lastMessage = messages[messages.length - 1];
    return {
      id: conv.id,
      title: (conv.title as string) || 'Untitled',
      preview: lastMessage?.content?.slice(0, 100) || '',
      createdAt: conv.createdAt,
      messageCount: messages.length,
    };
  });
}

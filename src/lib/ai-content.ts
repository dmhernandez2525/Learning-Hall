import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  ContentSuggestion,
  GeneratedQuiz,
  QuizQuestion,
  ContentSummary,
  AIContentAnalytics,
} from '@/types/ai-content';

// --------------- Formatters ---------------

export function formatSuggestion(doc: Record<string, unknown>): ContentSuggestion {
  const course = doc.course as string | Record<string, unknown>;
  const lesson = doc.lesson as string | Record<string, unknown>;
  const createdBy = doc.createdBy as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    lessonId: typeof lesson === 'object' ? String(lesson.id) : String(lesson ?? ''),
    type: (doc.type as ContentSuggestion['type']) ?? 'topic',
    title: String(doc.title ?? ''),
    content: String(doc.content ?? ''),
    status: (doc.status as ContentSuggestion['status']) ?? 'pending',
    createdBy: typeof createdBy === 'object' ? String(createdBy.id) : String(createdBy ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatQuiz(doc: Record<string, unknown>): GeneratedQuiz {
  const course = doc.course as string | Record<string, unknown>;
  const lesson = doc.lesson as string | Record<string, unknown>;
  const createdBy = doc.createdBy as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    lessonId: typeof lesson === 'object' ? String(lesson.id) : String(lesson ?? ''),
    title: String(doc.title ?? ''),
    questions: Array.isArray(doc.questions) ? (doc.questions as QuizQuestion[]) : [],
    difficulty: (doc.difficulty as GeneratedQuiz['difficulty']) ?? 'medium',
    status: (doc.status as GeneratedQuiz['status']) ?? 'draft',
    createdBy: typeof createdBy === 'object' ? String(createdBy.id) : String(createdBy ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatSummary(doc: Record<string, unknown>): ContentSummary {
  const course = doc.course as string | Record<string, unknown>;
  const lesson = doc.lesson as string | Record<string, unknown>;
  const createdBy = doc.createdBy as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    lessonId: typeof lesson === 'object' ? String(lesson.id) : String(lesson ?? ''),
    originalLength: Number(doc.originalLength ?? 0),
    summaryLength: Number(doc.summaryLength ?? 0),
    summary: String(doc.summary ?? ''),
    keyPoints: Array.isArray(doc.keyPoints) ? (doc.keyPoints as string[]) : [],
    status: (doc.status as ContentSummary['status']) ?? 'draft',
    createdBy: typeof createdBy === 'object' ? String(createdBy.id) : String(createdBy ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Suggestions ---------------

export async function listSuggestions(lessonId?: string): Promise<ContentSuggestion[]> {
  const payload = await getPayloadClient();
  const where: Where = lessonId ? { lesson: { equals: lessonId } } : {};
  const result = await payload.find({
    collection: 'content-suggestions',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatSuggestion(doc as Record<string, unknown>));
}

interface CreateSuggestionInput {
  courseId: string;
  lessonId: string;
  type: ContentSuggestion['type'];
  title: string;
  content: string;
}

export async function createSuggestion(input: CreateSuggestionInput, user: User): Promise<ContentSuggestion> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'content-suggestions',
    data: {
      course: input.courseId,
      lesson: input.lessonId,
      type: input.type,
      title: input.title,
      content: input.content,
      status: 'pending',
      createdBy: user.id,
      tenant: user.tenant,
    },
  });
  return formatSuggestion(doc as Record<string, unknown>);
}

export async function updateSuggestionStatus(
  id: string,
  status: 'accepted' | 'rejected'
): Promise<ContentSuggestion> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'content-suggestions',
    id,
    data: { status },
  });
  return formatSuggestion(doc as Record<string, unknown>);
}

// --------------- Quizzes ---------------

export async function listGeneratedQuizzes(lessonId?: string): Promise<GeneratedQuiz[]> {
  const payload = await getPayloadClient();
  const where: Where = lessonId ? { lesson: { equals: lessonId } } : {};
  const result = await payload.find({
    collection: 'generated-quizzes',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatQuiz(doc as Record<string, unknown>));
}

interface CreateQuizInput {
  courseId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: GeneratedQuiz['difficulty'];
}

export async function createGeneratedQuiz(input: CreateQuizInput, user: User): Promise<GeneratedQuiz> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'generated-quizzes',
    data: {
      course: input.courseId,
      lesson: input.lessonId,
      title: input.title,
      questions: input.questions,
      difficulty: input.difficulty,
      status: 'draft',
      createdBy: user.id,
      tenant: user.tenant,
    },
  });
  return formatQuiz(doc as Record<string, unknown>);
}

export async function updateQuizStatus(id: string, status: GeneratedQuiz['status']): Promise<GeneratedQuiz> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'generated-quizzes',
    id,
    data: { status },
  });
  return formatQuiz(doc as Record<string, unknown>);
}

// --------------- Summaries ---------------

export async function listSummaries(lessonId?: string): Promise<ContentSummary[]> {
  const payload = await getPayloadClient();
  const where: Where = lessonId ? { lesson: { equals: lessonId } } : {};
  const result = await payload.find({
    collection: 'content-summaries',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatSummary(doc as Record<string, unknown>));
}

interface CreateSummaryInput {
  courseId: string;
  lessonId: string;
  originalLength: number;
  summary: string;
  keyPoints: string[];
}

export async function createSummary(input: CreateSummaryInput, user: User): Promise<ContentSummary> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'content-summaries',
    data: {
      course: input.courseId,
      lesson: input.lessonId,
      originalLength: input.originalLength,
      summaryLength: input.summary.length,
      summary: input.summary,
      keyPoints: input.keyPoints,
      status: 'draft',
      createdBy: user.id,
      tenant: user.tenant,
    },
  });
  return formatSummary(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getAIContentAnalytics(): Promise<AIContentAnalytics> {
  const payload = await getPayloadClient();

  const suggestions = await payload.find({ collection: 'content-suggestions', limit: 500, depth: 0 });
  const quizzes = await payload.find({ collection: 'generated-quizzes', limit: 1, depth: 0 });
  const summaries = await payload.find({ collection: 'content-summaries', limit: 1, depth: 0 });

  let acceptedSuggestions = 0;
  let publishedQuizzes = 0;
  const suggestionsByType: Record<string, number> = {};

  for (const doc of suggestions.docs) {
    const raw = doc as Record<string, unknown>;
    const type = String(raw.type ?? 'topic');
    suggestionsByType[type] = (suggestionsByType[type] ?? 0) + 1;
    if (raw.status === 'accepted') acceptedSuggestions += 1;
  }

  const quizDocs = await payload.find({ collection: 'generated-quizzes', limit: 500, depth: 0 });
  for (const doc of quizDocs.docs) {
    const raw = doc as Record<string, unknown>;
    if (raw.status === 'published') publishedQuizzes += 1;
  }

  return {
    totalSuggestions: suggestions.totalDocs,
    acceptedSuggestions,
    totalQuizzes: quizzes.totalDocs,
    publishedQuizzes,
    totalSummaries: summaries.totalDocs,
    suggestionsByType,
  };
}

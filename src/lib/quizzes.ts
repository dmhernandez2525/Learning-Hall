import { getPayloadClient } from '@/lib/payload';
import type { Where } from 'payload';

export interface QuizMetadata {
  questionCount?: number;
  averageScore?: number;
  attemptCount?: number;
  passRate?: number;
}

export interface Quiz {
  id: string;
  title: string;
  slug?: string;
  status: 'draft' | 'published';
  description?: string;
  instructions?: string;
  course: {
    id: string;
    title: string;
    instructorId?: string;
  };
  passingScore: number;
  timeLimit?: number;
  retakes: number;
  randomizeQuestions: boolean;
  shuffleAnswers: boolean;
  questionsPerAttempt?: number;
  showExplanations: boolean;
  allowReview: boolean;
  metadata?: QuizMetadata;
}

export interface QuizListParams {
  page?: number;
  limit?: number;
  courseId?: string;
  status?: Quiz['status'];
  search?: string;
}

export interface QuizListResult {
  docs: Quiz[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function formatQuiz(doc: Record<string, unknown>): Quiz {
  const course = doc.course as Record<string, unknown> | string;
  const instructor = typeof course === 'object' ? (course.instructor as Record<string, unknown> | string | undefined) : undefined;
  const metadata = doc.metadata as Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    slug: doc.slug ? String(doc.slug) : undefined,
    status: (doc.status as Quiz['status']) || 'draft',
    description: doc.description ? String(doc.description) : undefined,
    instructions: doc.instructions ? String(doc.instructions) : undefined,
    course:
      typeof course === 'object'
        ? {
            id: String(course.id),
            title: String(course.title || ''),
            instructorId:
              typeof instructor === 'object'
                ? String(instructor.id)
                : typeof instructor === 'string'
                  ? instructor
                  : undefined,
          }
        : { id: String(course), title: '' },
    passingScore: Number(doc.passingScore || 70),
    timeLimit: doc.timeLimit ? Number(doc.timeLimit) : undefined,
    retakes: Number(doc.retakes ?? -1),
    randomizeQuestions: Boolean(doc.randomizeQuestions ?? true),
    shuffleAnswers: Boolean(doc.shuffleAnswers ?? true),
    questionsPerAttempt: doc.questionsPerAttempt
      ? Number(doc.questionsPerAttempt)
      : undefined,
    showExplanations: Boolean(doc.showExplanations ?? true),
    allowReview: Boolean(doc.allowReview ?? true),
    metadata: metadata
      ? {
          questionCount: metadata.questionCount ? Number(metadata.questionCount) : undefined,
          averageScore: metadata.averageScore ? Number(metadata.averageScore) : undefined,
          attemptCount: metadata.attemptCount ? Number(metadata.attemptCount) : undefined,
          passRate: metadata.passRate ? Number(metadata.passRate) : undefined,
        }
      : undefined,
  };
}

export async function listQuizzes(params: QuizListParams = {}): Promise<QuizListResult> {
  const payload = await getPayloadClient();
  const { page = 1, limit = 50, courseId, status, search } = params;

  const filters: Where[] = [];

  if (courseId) {
    filters.push({ course: { equals: courseId } });
  }

  if (status) {
    filters.push({ status: { equals: status } });
  }

  if (search) {
    filters.push({ title: { contains: search } });
  }

  const where: Where | undefined =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : { and: filters };

  const result = await payload.find({
    collection: 'quizzes',
    page,
    limit,
    where,
    depth: 1,
  });

  return {
    docs: result.docs.map((doc) => formatQuiz(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.findByID({
      collection: 'quizzes',
      id,
      depth: 1,
    });

    if (!result) return null;

    return formatQuiz(result as Record<string, unknown>);
  } catch {
    return null;
  }
}

export interface CreateQuizData {
  title: string;
  courseId: string;
  status?: Quiz['status'];
  description?: string;
  instructions?: string;
  passingScore?: number;
  timeLimit?: number;
  retakes?: number;
  randomizeQuestions?: boolean;
  shuffleAnswers?: boolean;
  questionsPerAttempt?: number;
  showExplanations?: boolean;
  allowReview?: boolean;
}

export async function createQuiz(data: CreateQuizData): Promise<Quiz> {
  const payload = await getPayloadClient();

  const result = await payload.create({
    collection: 'quizzes',
    data: {
      title: data.title,
      course: data.courseId,
      status: data.status,
      description: data.description,
      instructions: data.instructions,
      passingScore: data.passingScore,
      timeLimit: data.timeLimit,
      retakes: data.retakes,
      randomizeQuestions: data.randomizeQuestions,
      shuffleAnswers: data.shuffleAnswers,
      questionsPerAttempt: data.questionsPerAttempt,
      showExplanations: data.showExplanations,
      allowReview: data.allowReview,
    },
  });

  return formatQuiz(result as Record<string, unknown>);
}

export type UpdateQuizData = Partial<CreateQuizData>;

export async function updateQuiz(id: string, data: UpdateQuizData): Promise<Quiz> {
  const payload = await getPayloadClient();

  const result = await payload.update({
    collection: 'quizzes',
    id,
    data,
  });

  return formatQuiz(result as Record<string, unknown>);
}

export async function deleteQuiz(id: string): Promise<boolean> {
    try {
        const payload = await getPayloadClient();

        await payload.delete({
            collection: 'quizzes',
            id,
        });

        return true;
    } catch {
        return false;
    }
}

import { getPayloadClient } from '@/lib/payload';
import { getQuiz, type Quiz } from '@/lib/quizzes';
import { listQuestions, type Question, type QuestionOption } from '@/lib/questions';
import type { User } from '@/lib/auth/config';
import type { Where } from 'payload';

export type QuizAttemptStatus = 'inProgress' | 'completed' | 'timedOut';

export interface QuizAttemptQuestionSnapshot {
  questionId: string;
  questionType: Question['questionType'];
  prompt: string;
  options?: QuestionOption[];
  matchOptions?: string[];
  correctAnswer?: unknown;
  response?: unknown;
  explanation?: string;
  pointsPossible: number;
  pointsEarned: number;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  user: {
    id: string;
    email?: string;
    name?: string;
  };
  quiz: string;
  status: QuizAttemptStatus;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  retakeIndex: number;
  timeLimit?: number;
  durationSeconds?: number;
  startedAt: string;
  completedAt?: string;
  questions: QuizAttemptQuestionSnapshot[];
}

export interface AttemptAnswerInput {
  questionId: string;
  response: unknown;
}

export interface StartQuizAttemptOptions {
  quizId: string;
  user: Pick<User, 'id' | 'role' | 'email' | 'name'>;
}

export interface SubmitQuizAttemptOptions {
  attemptId: string;
  user: Pick<User, 'id' | 'role'>;
  answers: AttemptAnswerInput[];
}

export interface QuizAttemptListResult {
  docs: QuizAttempt[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QuizAttemptListParams {
  quizId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface QuizAnalyticsQuestion {
  questionId: string;
  prompt: string;
  correctRate: number;
  averageScore: number;
}

export interface QuizAnalytics {
  quizId: string;
  attemptCount: number;
  averageScore: number;
  passRate: number;
  averageDuration: number;
  questionStats: QuizAnalyticsQuestion[];
}

export function maskAttemptForLearner(
  attempt: QuizAttempt,
  options: { revealSolutions: boolean; revealExplanations: boolean }
): QuizAttempt {
  return {
    ...attempt,
    questions: attempt.questions.map((question) => ({
      ...question,
      options: question.options?.map((option) => ({
        ...option,
        isCorrect: options.revealSolutions ? option.isCorrect : undefined,
        match: options.revealSolutions ? option.match : undefined,
      })),
      correctAnswer: options.revealSolutions ? question.correctAnswer : undefined,
      explanation: options.revealExplanations ? question.explanation : undefined,
    })),
  };
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function buildCorrectAnswer(question: Question): unknown {
  switch (question.questionType) {
    case 'multipleChoice':
      return question.options?.filter((option) => option.isCorrect).map((option) => option.id) ?? [];
    case 'trueFalse':
      return question.trueFalseAnswer;
    case 'shortAnswer':
      return question.shortAnswer;
    case 'matching': {
      const matches: Record<string, string> = {};
      question.options?.forEach((option) => {
        matches[option.id] = option.match || '';
      });
      return matches;
    }
    default:
      return undefined;
  }
}

function buildAttemptQuestions(quiz: Quiz, questions: Question[]): QuizAttemptQuestionSnapshot[] {
  let pool = [...questions];

  if (quiz.randomizeQuestions) {
    pool = shuffle(pool);
  }

  if (quiz.questionsPerAttempt && quiz.questionsPerAttempt < pool.length) {
    pool = pool.slice(0, quiz.questionsPerAttempt);
  }

  return pool.map((question) => {
    const options = question.options ? (quiz.shuffleAnswers ? shuffle(question.options) : question.options) : undefined;
    const matchOptions =
      question.questionType === 'matching'
        ? shuffle(
            (question.options || [])
              .map((option) => option.match)
              .filter((match): match is string => Boolean(match))
          )
        : undefined;

    return {
      questionId: question.id,
      questionType: question.questionType,
      prompt: question.questionText,
      options,
      matchOptions,
      correctAnswer: buildCorrectAnswer(question),
      response: null,
      explanation: question.explanation,
      pointsPossible: question.points,
      pointsEarned: 0,
      isCorrect: false,
    } satisfies QuizAttemptQuestionSnapshot;
  });
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function gradeQuestion(
  snapshot: QuizAttemptQuestionSnapshot,
  response: unknown
): { isCorrect: boolean; pointsEarned: number; response: unknown } {
  const points = snapshot.pointsPossible || 0;

  switch (snapshot.questionType) {
    case 'multipleChoice': {
      const correct = Array.isArray(snapshot.correctAnswer)
        ? [...(snapshot.correctAnswer as string[])].sort()
        : [];
      const provided = Array.isArray(response)
        ? [...(response as string[])].sort()
        : typeof response === 'string'
          ? [response]
          : [];
      const isCorrect = correct.length === provided.length && correct.every((value, index) => value === provided[index]);
      return { isCorrect, pointsEarned: isCorrect ? points : 0, response: provided };
    }
    case 'trueFalse': {
      const answer = typeof snapshot.correctAnswer === 'string' ? snapshot.correctAnswer : '';
      const provided = typeof response === 'string' ? response : '';
      const isCorrect = answer === provided;
      return { isCorrect, pointsEarned: isCorrect ? points : 0, response: provided };
    }
    case 'shortAnswer': {
      const expected = normalizeText(snapshot.correctAnswer);
      const provided = normalizeText(response);
      const isCorrect = Boolean(expected) && provided.includes(expected);
      return { isCorrect, pointsEarned: isCorrect ? points : 0, response };
    }
    case 'matching': {
      const expected = snapshot.correctAnswer as Record<string, string> | undefined;
      const provided = typeof response === 'object' && response !== null ? (response as Record<string, string>) : {};
      const pairs = Object.entries(expected || {});
      const correctMatches = pairs.filter(([optionId, match]) => normalizeText(provided[optionId]) === normalizeText(match));
      const isCorrect = correctMatches.length === pairs.length && pairs.length > 0;
      const earned = pairs.length === 0 ? 0 : (points * correctMatches.length) / pairs.length;
      return { isCorrect, pointsEarned: earned, response: provided };
    }
    default:
      return { isCorrect: false, pointsEarned: 0, response };
  }
}

function serializeAttempt(doc: Record<string, unknown>): QuizAttempt {
  const user = doc.user as Record<string, unknown> | string;
  const questions = (doc.questions as Array<Record<string, unknown>> | undefined)?.map((question) => ({
    questionId: String(question.questionId || ''),
    questionType: question.questionType as QuizAttemptQuestionSnapshot['questionType'],
    prompt: String(question.prompt || ''),
    options: question.options as QuestionOption[] | undefined,
    matchOptions: question.matchOptions as string[] | undefined,
    correctAnswer: question.correctAnswer,
    response: question.response,
    explanation: question.explanation ? String(question.explanation) : undefined,
    pointsPossible: Number(question.pointsPossible || 0),
    pointsEarned: Number(question.pointsEarned || 0),
    isCorrect: question.isCorrect === true,
  }));

  return {
    id: String(doc.id),
    user:
      typeof user === 'object'
        ? {
            id: String(user.id),
            email: user.email ? String(user.email) : undefined,
            name: user.name ? String(user.name) : undefined,
          }
        : { id: String(user) },
    quiz: typeof doc.quiz === 'object' ? String((doc.quiz as Record<string, unknown>).id) : String(doc.quiz),
    status: (doc.status as QuizAttemptStatus) || 'inProgress',
    score: Number(doc.score || 0),
    maxScore: Number(doc.maxScore || 0),
    percentage: Number(doc.percentage || 0),
    passed: doc.passed === true,
    retakeIndex: Number(doc.retakeIndex || 1),
    timeLimit: doc.timeLimit ? Number(doc.timeLimit) : undefined,
    durationSeconds: doc.durationSeconds ? Number(doc.durationSeconds) : undefined,
    startedAt: String(doc.startedAt || new Date().toISOString()),
    completedAt: doc.completedAt ? String(doc.completedAt) : undefined,
    questions: questions || [],
  };
}

async function ensureEnrollment(userId: string, courseId: string): Promise<void> {
  const payload = await getPayloadClient();

  const enrollment = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { user: { equals: userId } },
        { course: { equals: courseId } },
      ],
    },
    limit: 1,
  });

  if (enrollment.totalDocs === 0) {
    throw new Error('You must be enrolled in this course to take the quiz');
  }
}

async function getActiveAttempt(payload: Awaited<ReturnType<typeof getPayloadClient>>, quizId: string, userId: string) {
  const existing = await payload.find({
    collection: 'quiz-attempts',
    where: {
      and: [
        { quiz: { equals: quizId } },
        { user: { equals: userId } },
        { status: { equals: 'inProgress' } },
      ],
    },
    limit: 1,
    depth: 1,
  });

  return existing.docs[0] as Record<string, unknown> | undefined;
}

async function countCompletedAttempts(quizId: string, userId: string): Promise<number> {
  const payload = await getPayloadClient();

  const attempts = await payload.find({
    collection: 'quiz-attempts',
    where: {
      and: [
        { quiz: { equals: quizId } },
        { user: { equals: userId } },
        { status: { not_equals: 'inProgress' } },
      ],
    },
    limit: 1,
  });

  return attempts.totalDocs;
}

async function refreshQuizMetadata(quizId: string): Promise<void> {
  const payload = await getPayloadClient();

  const attempts = await payload.find({
    collection: 'quiz-attempts',
    where: {
      and: [
        { quiz: { equals: quizId } },
        { status: { not_equals: 'inProgress' } },
      ],
    },
    limit: 1000,
  });

  const docs = attempts.docs as Array<Record<string, unknown>>;
  const attemptCount = docs.length;
  const scores = docs.map((doc) => Number(doc.percentage || 0));
  const averageScore = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  const passRate = docs.length
    ? (docs.filter((doc) => doc.passed === true).length / docs.length) * 100
    : 0;

  const questionBank = await listQuestions(quizId);

  await payload.update({
    collection: 'quizzes',
    id: quizId,
    data: {
      metadata: {
        questionCount: questionBank.length,
        averageScore,
        attemptCount,
        passRate,
      },
    },
  });
}

export async function startQuizAttempt({ quizId, user }: StartQuizAttemptOptions): Promise<QuizAttempt> {
  const payload = await getPayloadClient();
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  if (quiz.status !== 'published' && user.role === 'student') {
    throw new Error('Quiz is not published yet');
  }

  if (user.role === 'student') {
    await ensureEnrollment(user.id, quiz.course.id);
  }

  const existing = await getActiveAttempt(payload, quizId, user.id);
  if (existing) {
    return serializeAttempt(existing);
  }

  const completedAttempts = user.role === 'student' ? await countCompletedAttempts(quizId, user.id) : 0;

  if (user.role === 'student' && quiz.retakes >= 0 && completedAttempts >= quiz.retakes) {
    throw new Error('You have reached the maximum number of attempts for this quiz');
  }

  const questions = await listQuestions(quizId);
  if (questions.length === 0) {
    throw new Error('Quiz has no questions yet');
  }

  const attemptQuestions = buildAttemptQuestions(quiz, questions);

  const result = await payload.create({
    collection: 'quiz-attempts',
    data: {
      user: user.id,
      quiz: quizId,
      status: 'inProgress',
      score: 0,
      maxScore: attemptQuestions.reduce((sum, question) => sum + question.pointsPossible, 0),
      percentage: 0,
      passed: false,
      retakeIndex: completedAttempts + 1,
      timeLimit: quiz.timeLimit,
      startedAt: new Date().toISOString(),
      questions: attemptQuestions,
    },
  });

  return serializeAttempt(result as Record<string, unknown>);
}

export async function submitQuizAttempt({ attemptId, user, answers }: SubmitQuizAttemptOptions): Promise<QuizAttempt> {
  const payload = await getPayloadClient();

  const doc = await payload.findByID({
    collection: 'quiz-attempts',
    id: attemptId,
    depth: 2,
  });

  if (!doc) {
    throw new Error('Attempt not found');
  }

  if (typeof doc.user === 'string' ? doc.user !== user.id : String((doc.user as Record<string, unknown>).id) !== user.id) {
    throw new Error('You do not have access to this attempt');
  }

  if (doc.status !== 'inProgress') {
    return serializeAttempt(doc as Record<string, unknown>);
  }

  const submittedAt = new Date();
  const startedAt = doc.startedAt ? new Date(doc.startedAt) : submittedAt;
  const quizId = typeof doc.quiz === 'object' ? String((doc.quiz as Record<string, unknown>).id) : String(doc.quiz);
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const answersById = new Map(answers.map((answer) => [answer.questionId, answer.response] as const));

  const gradedQuestions = (doc.questions as Array<Record<string, unknown>>).map((question) => {
    const snapshot = {
      questionId: String(question.questionId || ''),
      questionType: question.questionType as QuizAttemptQuestionSnapshot['questionType'],
      prompt: String(question.prompt || ''),
      options: question.options as QuestionOption[] | undefined,
      matchOptions: question.matchOptions as string[] | undefined,
      correctAnswer: question.correctAnswer,
      response: question.response ?? null,
      explanation: question.explanation ? String(question.explanation) : undefined,
      pointsPossible: Number(question.pointsPossible || 0),
      pointsEarned: Number(question.pointsEarned || 0),
      isCorrect: question.isCorrect === true,
    } satisfies QuizAttemptQuestionSnapshot;

    const response = answersById.get(snapshot.questionId);
    if (response === undefined) {
      return snapshot;
    }

    const graded = gradeQuestion(snapshot, response);
    return {
      ...snapshot,
      response: graded.response,
      pointsEarned: graded.pointsEarned,
      isCorrect: graded.isCorrect,
    } satisfies QuizAttemptQuestionSnapshot;
  });

  const score = gradedQuestions.reduce((sum, question) => sum + question.pointsEarned, 0);
  const maxScore = gradedQuestions.reduce((sum, question) => sum + question.pointsPossible, 0);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const timedOut = quiz.timeLimit && (submittedAt.getTime() - startedAt.getTime()) / 60000 > quiz.timeLimit;
  const status: QuizAttemptStatus = timedOut ? 'timedOut' : 'completed';
  const passed = percentage >= quiz.passingScore;

  const updated = await payload.update({
    collection: 'quiz-attempts',
    id: attemptId,
    data: {
      status,
      score,
      maxScore,
      percentage,
      passed,
      durationSeconds: Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000),
      completedAt: submittedAt.toISOString(),
      questions: gradedQuestions,
    },
  });

  await refreshQuizMetadata(quizId);

  return serializeAttempt(updated as Record<string, unknown>);
}

export async function listQuizAttempts(params: QuizAttemptListParams = {}): Promise<QuizAttemptListResult> {
  const payload = await getPayloadClient();
  const { quizId, userId, page = 1, limit = 20 } = params;

  const filters: Where[] = [];

  if (quizId) filters.push({ quiz: { equals: quizId } });
  if (userId) filters.push({ user: { equals: userId } });

  const where = filters.length
    ? filters.length === 1
      ? filters[0]
      : { and: filters }
    : undefined;

  const result = await payload.find({
    collection: 'quiz-attempts',
    where,
    page,
    limit,
    depth: 1,
    sort: '-createdAt',
  });

  return {
    docs: result.docs.map((doc) => serializeAttempt(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getQuizAttempt(id: string): Promise<QuizAttempt | null> {
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findByID({
      collection: 'quiz-attempts',
      id,
      depth: 1,
    });

    if (!doc) return null;

    return serializeAttempt(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
  const payload = await getPayloadClient();

  const attempts = await payload.find({
    collection: 'quiz-attempts',
    where: {
      and: [
        { quiz: { equals: quizId } },
        { status: { not_equals: 'inProgress' } },
      ],
    },
    limit: 1000,
  });

  const docs = attempts.docs as Array<Record<string, unknown>>;
  const attemptCount = docs.length;
  const totalScore = docs.reduce((sum, doc) => sum + Number(doc.percentage || 0), 0);
  const averageScore = attemptCount ? totalScore / attemptCount : 0;
  const passRate = attemptCount
    ? (docs.filter((doc) => doc.passed === true).length / attemptCount) * 100
    : 0;
  const averageDuration = attemptCount
    ? docs.reduce((sum, doc) => sum + Number(doc.durationSeconds || 0), 0) / attemptCount
    : 0;

  const questionStatsMap = new Map<
    string,
    {
      questionId: string;
      prompt: string;
      attempts: number;
      correctCount: number;
      pointsEarned: number;
      pointsPossible: number;
    }
  >();

  docs.forEach((doc) => {
    const questions = doc.questions as Array<Record<string, unknown>> | undefined;
    questions?.forEach((question) => {
      const id = String(question.questionId || '');
      if (!id) return;

      const existing = questionStatsMap.get(id);
      const attemptsCount = (existing?.attempts ?? 0) + 1;
      const correctCount = (existing?.correctCount ?? 0) + (question.isCorrect === true ? 1 : 0);
      const pointsPossible = Number(question.pointsPossible || 0);
      const pointsEarned = Number(question.pointsEarned || 0);

      questionStatsMap.set(id, {
        questionId: id,
        prompt: String(question.prompt || ''),
        attempts: attemptsCount,
        correctCount,
        pointsEarned: (existing?.pointsEarned ?? 0) + pointsEarned,
        pointsPossible: (existing?.pointsPossible ?? 0) + pointsPossible,
      });
    });
  });

  const questionStats: QuizAnalyticsQuestion[] = Array.from(questionStatsMap.values()).map((stat) => ({
    questionId: stat.questionId,
    prompt: stat.prompt,
    correctRate: stat.attempts ? (stat.correctCount / stat.attempts) * 100 : 0,
    averageScore: stat.attempts ? stat.pointsEarned / stat.attempts : 0,
  }));

  return {
    quizId,
    attemptCount,
    averageScore,
    passRate,
    averageDuration,
    questionStats,
  };
}

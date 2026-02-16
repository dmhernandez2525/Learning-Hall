import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  MicroLesson,
  SpacedRepetitionCard,
  DailyChallenge,
  ChallengeQuestion,
  MicrolearningAnalytics,
} from '@/types/microlearning';

// --------------- Formatters ---------------

export function formatMicroLesson(doc: Record<string, unknown>): MicroLesson {
  const course = doc.course as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    title: String(doc.title ?? ''),
    content: String(doc.content ?? ''),
    durationMinutes: Number(doc.durationMinutes ?? 0),
    order: Number(doc.order ?? 0),
    status: (doc.status as MicroLesson['status']) ?? 'draft',
  };
}

export function formatCard(doc: Record<string, unknown>): SpacedRepetitionCard {
  const lesson = doc.lesson as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    lessonId: typeof lesson === 'object' ? String(lesson.id) : String(lesson ?? ''),
    question: String(doc.question ?? ''),
    answer: String(doc.answer ?? ''),
    interval: Number(doc.interval ?? 1),
    nextReviewAt: String(doc.nextReviewAt ?? ''),
    easeFactor: Number(doc.easeFactor ?? 2.5),
    repetitions: Number(doc.repetitions ?? 0),
  };
}

export function formatChallenge(doc: Record<string, unknown>): DailyChallenge {
  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    questions: Array.isArray(doc.questions) ? (doc.questions as ChallengeQuestion[]) : [],
    difficulty: (doc.difficulty as DailyChallenge['difficulty']) ?? 'easy',
    points: Number(doc.points ?? 0),
    activeDate: String(doc.activeDate ?? ''),
    status: (doc.status as DailyChallenge['status']) ?? 'active',
  };
}

// --------------- Micro Lessons ---------------

export async function listMicroLessons(courseId?: string): Promise<MicroLesson[]> {
  const payload = await getPayloadClient();
  const where: Where = courseId ? { course: { equals: courseId } } : {};
  const result = await payload.find({
    collection: 'micro-lessons',
    where,
    sort: 'order',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatMicroLesson(doc as Record<string, unknown>));
}

interface CreateMicroLessonInput {
  courseId: string;
  title: string;
  content: string;
  durationMinutes: number;
  order?: number;
}

export async function createMicroLesson(input: CreateMicroLessonInput, user: User): Promise<MicroLesson> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'micro-lessons',
    data: {
      course: input.courseId,
      title: input.title,
      content: input.content,
      durationMinutes: input.durationMinutes,
      order: input.order ?? 0,
      status: 'draft',
      tenant: user.tenant,
    },
  });
  return formatMicroLesson(doc as Record<string, unknown>);
}

// --------------- Spaced Repetition Cards ---------------

export async function listCards(lessonId?: string): Promise<SpacedRepetitionCard[]> {
  const payload = await getPayloadClient();
  const where: Where = lessonId ? { lesson: { equals: lessonId } } : {};
  const result = await payload.find({
    collection: 'spaced-repetition-cards',
    where,
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatCard(doc as Record<string, unknown>));
}

interface CreateCardInput {
  lessonId: string;
  question: string;
  answer: string;
}

export async function createCard(input: CreateCardInput, user: User): Promise<SpacedRepetitionCard> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'spaced-repetition-cards',
    data: {
      lesson: input.lessonId,
      question: input.question,
      answer: input.answer,
      interval: 1,
      nextReviewAt: new Date().toISOString(),
      easeFactor: 2.5,
      repetitions: 0,
      tenant: user.tenant,
    },
  });
  return formatCard(doc as Record<string, unknown>);
}

export async function getNextDueCards(limit = 20): Promise<SpacedRepetitionCard[]> {
  const payload = await getPayloadClient();
  const now = new Date().toISOString();
  const result = await payload.find({
    collection: 'spaced-repetition-cards',
    where: {
      nextReviewAt: { less_than_equal: now },
    } as Where,
    sort: 'nextReviewAt',
    limit,
    depth: 0,
  });
  return result.docs.map((doc) => formatCard(doc as Record<string, unknown>));
}

// --------------- Daily Challenges ---------------

export async function listChallenges(difficulty?: string): Promise<DailyChallenge[]> {
  const payload = await getPayloadClient();
  const where: Where = difficulty ? { difficulty: { equals: difficulty } } : {};
  const result = await payload.find({
    collection: 'daily-challenges',
    where,
    sort: '-activeDate',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatChallenge(doc as Record<string, unknown>));
}

interface CreateChallengeInput {
  title: string;
  questions: ChallengeQuestion[];
  difficulty: DailyChallenge['difficulty'];
  points: number;
  activeDate: string;
}

export async function createChallenge(input: CreateChallengeInput, user: User): Promise<DailyChallenge> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'daily-challenges',
    data: {
      title: input.title,
      questions: input.questions,
      difficulty: input.difficulty,
      points: input.points,
      activeDate: input.activeDate,
      status: 'active',
      tenant: user.tenant,
    },
  });
  return formatChallenge(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getMicrolearningAnalytics(): Promise<MicrolearningAnalytics> {
  const payload = await getPayloadClient();

  const lessons = await payload.find({ collection: 'micro-lessons', limit: 500, depth: 0 });
  const cards = await payload.find({ collection: 'spaced-repetition-cards', limit: 500, depth: 0 });
  const challenges = await payload.find({ collection: 'daily-challenges', limit: 500, depth: 0 });

  let publishedLessons = 0;
  for (const doc of lessons.docs) {
    if ((doc as Record<string, unknown>).status === 'published') publishedLessons += 1;
  }

  const now = new Date().toISOString();
  let dueCards = 0;
  for (const doc of cards.docs) {
    const raw = doc as Record<string, unknown>;
    if (String(raw.nextReviewAt ?? '') <= now) dueCards += 1;
  }

  const challengesByDifficulty: Record<string, number> = {};
  for (const doc of challenges.docs) {
    const diff = String((doc as Record<string, unknown>).difficulty ?? 'easy');
    challengesByDifficulty[diff] = (challengesByDifficulty[diff] ?? 0) + 1;
  }

  return {
    totalMicroLessons: lessons.totalDocs,
    publishedLessons,
    totalCards: cards.totalDocs,
    dueCards,
    totalChallenges: challenges.totalDocs,
    challengesByDifficulty,
  };
}

import { getPayloadClient } from '@/lib/payload';

export type QuestionType = 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'matching';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  match?: string;
}

export interface Question {
  id: string;
  quiz: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points: number;
  options?: QuestionOption[];
  trueFalseAnswer?: 'true' | 'false';
  shortAnswer?: string;
  explanation?: string;
}

function formatQuestion(doc: Record<string, unknown>): Question {
  const options = (doc.options as Array<Record<string, unknown>> | undefined)?.map((option) => ({
    id: String(option.id || ''),
    text: String(option.text || ''),
    isCorrect: option.isCorrect === true,
    match: option.match ? String(option.match) : undefined,
  }));

  const tags = (doc.tags as Array<Record<string, unknown>> | undefined)?.map((tag) =>
    String(tag.value || '')
  );

  return {
    id: String(doc.id),
    quiz: typeof doc.quiz === 'object' ? String((doc.quiz as Record<string, unknown>).id) : String(doc.quiz),
    questionText: String(doc.questionText || ''),
    questionType: (doc.questionType as Question['questionType']) || 'multipleChoice',
    difficulty: (doc.difficulty as Question['difficulty']) || 'medium',
    tags,
    points: Number(doc.points ?? 1),
    options,
    trueFalseAnswer: doc.trueFalseAnswer as Question['trueFalseAnswer'],
    shortAnswer: doc.shortAnswer ? String(doc.shortAnswer) : undefined,
    explanation: doc.explanation ? String(doc.explanation) : undefined,
  };
}

export async function listQuestions(quizId: string): Promise<Question[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'questions',
    where: {
      quiz: {
        equals: quizId,
      },
    },
    limit: 1000,
  });

  return result.docs.map((doc) => formatQuestion(doc as Record<string, unknown>));
}

export async function getQuestion(id: string): Promise<Question | null> {
    try {
        const payload = await getPayloadClient();

        const result = await payload.findByID({
            collection: 'questions',
            id,
        });

        if (!result) return null;

        return formatQuestion(result as Record<string, unknown>);
    } catch {
        return null;
    }
}

export interface SaveQuestionData {
  quiz: string;
  questionText: string;
  questionType: QuestionType;
  difficulty?: Question['difficulty'];
  tags?: string[];
  points?: number;
  options?: QuestionOption[];
  trueFalseAnswer?: 'true' | 'false';
  shortAnswer?: string;
  explanation?: string;
}

function normalizeQuestionPayload(data: Partial<SaveQuestionData>) {
  const payload: Record<string, unknown> = {};

  if (data.quiz !== undefined) payload.quiz = data.quiz;
  if (data.questionText !== undefined) payload.questionText = data.questionText;
  if (data.questionType !== undefined) payload.questionType = data.questionType;
  if (data.difficulty !== undefined) payload.difficulty = data.difficulty;
  if (data.tags !== undefined) payload.tags = data.tags.map((value) => ({ value }));
  if (data.points !== undefined) payload.points = data.points;
  if (data.options !== undefined) payload.options = data.options;
  if (data.trueFalseAnswer !== undefined) payload.trueFalseAnswer = data.trueFalseAnswer;
  if (data.shortAnswer !== undefined) payload.shortAnswer = data.shortAnswer;
  if (data.explanation !== undefined) payload.explanation = data.explanation;

  return payload;
}

export async function createQuestion(data: SaveQuestionData): Promise<Question> {
  const payload = await getPayloadClient();

  const result = await payload.create({
    collection: 'questions',
    data: normalizeQuestionPayload(data),
  });

  return formatQuestion(result as Record<string, unknown>);
}

export async function updateQuestion(id: string, data: Partial<SaveQuestionData>): Promise<Question> {
  const payload = await getPayloadClient();

  const result = await payload.update({
    collection: 'questions',
    id,
    data: normalizeQuestionPayload(data),
  });

  return formatQuestion(result as Record<string, unknown>);
}

export async function deleteQuestion(id: string): Promise<boolean> {
    try {
        const payload = await getPayloadClient();

        await payload.delete({
            collection: 'questions',
            id,
        });

        return true;
    } catch {
        return false;
    }
}

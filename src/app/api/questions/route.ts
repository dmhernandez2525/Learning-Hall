import { NextRequest, NextResponse } from 'next/server';
import { listQuestions, createQuestion, type QuestionOption } from '@/lib/questions';
import { getQuiz } from '@/lib/quizzes';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

function canManageQuiz(userRole: string, userId: string, quizInstructorId?: string): boolean {
  if (userRole === 'admin') return true;
  if (userRole === 'instructor' && quizInstructorId && quizInstructorId === userId) {
    return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json(
        { error: 'quizId is required' },
        { status: 400 }
      );
    }

    const quiz = await getQuiz(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    if (!canManageQuiz(user.role, user.id, quiz.course.instructorId)) {
      return NextResponse.json({ error: 'Not authorized to view this question bank' }, { status: 403 });
    }

    const questions = await listQuestions(quizId);
    return NextResponse.json({ docs: questions, totalDocs: questions.length });
  } catch (error) {
    console.error('List questions error:', error);
    return NextResponse.json(
      { error: 'Failed to list questions' },
      { status: 500 }
    );
  }
}

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  isCorrect: z.boolean().optional(),
  match: z.string().optional(),
});

const createQuestionSchema = z
  .object({
    quiz: z.string().min(1),
    questionText: z.string().min(1),
    questionType: z.enum(['multipleChoice', 'trueFalse', 'shortAnswer', 'matching']),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    tags: z.array(z.string().min(1)).optional(),
    points: z.number().min(0.5).max(100).default(1),
    options: z.array(optionSchema).optional(),
    trueFalseAnswer: z.enum(['true', 'false']).optional(),
    shortAnswer: z.string().optional(),
    explanation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (['multipleChoice', 'matching'].includes(data.questionType) && (!data.options || data.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Options are required for this question type',
        path: ['options'],
      });
    }

    if (data.questionType === 'multipleChoice' && data.options && data.options.every((option) => !option.isCorrect)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mark at least one option as correct',
        path: ['options'],
      });
    }

    if (data.questionType === 'trueFalse' && !data.trueFalseAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'True/False questions require an answer',
        path: ['trueFalseAnswer'],
      });
    }

    if (data.questionType === 'shortAnswer' && !data.shortAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a reference answer for short answer questions',
        path: ['shortAnswer'],
      });
    }
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
    const result = createQuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const quiz = await getQuiz(result.data.quiz);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (!canManageQuiz(user.role, user.id, quiz.course.instructorId)) {
      return NextResponse.json({ error: 'Not authorized to modify this quiz' }, { status: 403 });
    }

    const payload = result.data;
    const question = await createQuestion({
      quiz: payload.quiz,
      questionText: payload.questionText,
      questionType: payload.questionType,
      difficulty: payload.difficulty,
      tags: payload.tags,
      points: payload.points,
      options: payload.options as QuestionOption[] | undefined,
      trueFalseAnswer: payload.trueFalseAnswer,
      shortAnswer: payload.shortAnswer,
      explanation: payload.explanation,
    });

    return NextResponse.json({ doc: question }, { status: 201 });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

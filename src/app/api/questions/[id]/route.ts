import { NextRequest, NextResponse } from 'next/server';
import { getQuestion, updateQuestion, deleteQuestion, type QuestionOption } from '@/lib/questions';
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

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const question = await getQuestion(id);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const quiz = await getQuiz(question.quiz);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (!canManageQuiz(user.role, user.id, quiz.course.instructorId)) {
      return NextResponse.json({ error: 'Not authorized to view this question' }, { status: 403 });
    }

    return NextResponse.json({ doc: question });
  } catch (error) {
    console.error('Get question error:', error);
    return NextResponse.json({ error: 'Failed to get question' }, { status: 500 });
  }
}

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  isCorrect: z.boolean().optional(),
  match: z.string().optional(),
});

const updateQuestionSchema = z
  .object({
    questionText: z.string().optional(),
    questionType: z.enum(['multipleChoice', 'trueFalse', 'shortAnswer', 'matching']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    tags: z.array(z.string().min(1)).optional(),
    points: z.number().min(0.5).max(100).optional(),
    options: z.array(optionSchema).optional(),
    trueFalseAnswer: z.enum(['true', 'false']).optional(),
    shortAnswer: z.string().optional(),
    explanation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.questionType && ['multipleChoice', 'matching'].includes(data.questionType) && data.options && data.options.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options cannot be empty', path: ['options'] });
    }
  });

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const question = await getQuestion(id);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const quiz = await getQuiz(question.quiz);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (!canManageQuiz(user.role, user.id, quiz.course.instructorId)) {
      return NextResponse.json({ error: 'Not authorized to edit this question' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateQuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const updated = await updateQuestion(id, {
      questionText: result.data.questionText,
      questionType: result.data.questionType,
      difficulty: result.data.difficulty,
      tags: result.data.tags,
      points: result.data.points,
      options: result.data.options as QuestionOption[] | undefined,
      trueFalseAnswer: result.data.trueFalseAnswer,
      shortAnswer: result.data.shortAnswer,
      explanation: result.data.explanation,
    });

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const question = await getQuestion(id);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const quiz = await getQuiz(question.quiz);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (!canManageQuiz(user.role, user.id, quiz.course.instructorId)) {
      return NextResponse.json({ error: 'Not authorized to delete this question' }, { status: 403 });
    }

    const success = await deleteQuestion(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}

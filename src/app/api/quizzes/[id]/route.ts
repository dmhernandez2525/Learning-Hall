import { NextRequest, NextResponse } from 'next/server';
import { getQuiz, updateQuiz, deleteQuiz } from '@/lib/quizzes';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const quiz = await getQuiz(id);

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const course = await getCourse(quiz.course.id);
    if (course && course.status !== 'published') {
      const user = await getSession();

      if (!user) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }

      const instructorId =
        typeof course.instructor === 'object'
          ? course.instructor.id
          : course.instructor;

      if (user.role !== 'admin' && instructorId !== user.id) {
        return NextResponse.json(
          { error: 'Quiz not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ doc: quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to get quiz' },
      { status: 500 }
    );
  }
}

const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  timeLimit: z.number().min(0).optional(),
  retakes: z.number().min(-1).optional(),
  randomizeQuestions: z.boolean().optional(),
  shuffleAnswers: z.boolean().optional(),
  questionsPerAttempt: z.number().min(1).optional(),
  showExplanations: z.boolean().optional(),
  allowReview: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const quiz = await getQuiz(id);

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const course = await getCourse(quiz.course.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const instructorId =
      typeof course.instructor === 'object'
        ? course.instructor.id
        : course.instructor;

    if (user.role !== 'admin' && instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this quiz' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateQuiz(id, result.data);

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('Update quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const quiz = await getQuiz(id);

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const course = await getCourse(quiz.course.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const instructorId =
      typeof course.instructor === 'object'
        ? course.instructor.id
        : course.instructor;

    if (user.role !== 'admin' && instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this quiz' },
        { status: 403 }
      );
    }

    const success = await deleteQuiz(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}

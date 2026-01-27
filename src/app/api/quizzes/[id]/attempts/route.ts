import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getQuiz } from '@/lib/quizzes';
import { listQuizAttempts, startQuizAttempt, maskAttemptForLearner } from '@/lib/quizAttempts';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function isInstructor(userRole: string, userId: string, quizInstructorId?: string) {
  if (userRole === 'admin') return true;
  if (userRole === 'instructor' && quizInstructorId === userId) return true;
  return false;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const quiz = await getQuiz(id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (user.role === 'student') {
    const attempts = await listQuizAttempts({ quizId: id, userId: user.id, page, limit });
    return NextResponse.json({
      ...attempts,
      docs: attempts.docs.map((attempt) => ({ ...attempt, questions: [] })),
    });
    }

    if (!isInstructor(user.role, user.id, quiz.course.instructorId)) {
      return NextResponse.json({ error: 'Not authorized to view attempts for this quiz' }, { status: 403 });
    }

    const userId = searchParams.get('userId') || undefined;
    const attempts = await listQuizAttempts({ quizId: id, userId, page, limit });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('List quiz attempts error:', error);
    return NextResponse.json({ error: 'Failed to load attempts' }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const quiz = await getQuiz(id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const attempt = await startQuizAttempt({ quizId: id, user });
    const doc =
      user.role === 'student'
        ? maskAttemptForLearner(attempt, { revealSolutions: false, revealExplanations: false })
        : attempt;

    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to start quiz attempt' }, { status: 400 });
  }
}

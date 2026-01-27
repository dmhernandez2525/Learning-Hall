import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getQuiz } from '@/lib/quizzes';
import { getQuizAnalytics } from '@/lib/quizAttempts';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
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

    if (!(user.role === 'admin' || (user.role === 'instructor' && quiz.course.instructorId === user.id))) {
      return NextResponse.json({ error: 'Not authorized to view analytics' }, { status: 403 });
    }

    const analytics = await getQuizAnalytics(id);
    return NextResponse.json({ doc: analytics });
  } catch (error) {
    console.error('Quiz analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}

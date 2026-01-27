import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getQuiz } from '@/lib/quizzes';
import { getQuizAttempt, submitQuizAttempt, maskAttemptForLearner } from '@/lib/quizAttempts';

interface RouteParams {
  params: Promise<{ id: string; attemptId: string }>;
}

function isInstructor(userRole: string, userId: string, quizInstructorId?: string) {
  if (userRole === 'admin') return true;
  if (userRole === 'instructor' && quizInstructorId === userId) return true;
  return false;
}

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        response: z.any().optional(),
      })
    )
    .min(1),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id, attemptId } = await params;
    const attempt = await getQuizAttempt(attemptId);

    if (!attempt || attempt.quiz !== id) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const quiz = await getQuiz(id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const isOwner = attempt.user.id === user.id;
    const isInstructorView = isInstructor(user.role, user.id, quiz.course.instructorId);
    if (!isOwner && !isInstructorView) {
      return NextResponse.json({ error: 'Not authorized to view this attempt' }, { status: 403 });
    }
    const doc =
      isOwner && user.role === 'student'
        ? maskAttemptForLearner(attempt, {
            revealSolutions: attempt.status !== 'inProgress' && quiz.allowReview,
            revealExplanations:
              attempt.status !== 'inProgress' && quiz.allowReview && quiz.showExplanations,
          })
        : attempt;

    return NextResponse.json({ doc });
  } catch (error) {
    console.error('Get quiz attempt error:', error);
    return NextResponse.json({ error: 'Failed to load attempt' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id, attemptId } = await params;
    const attempt = await getQuizAttempt(attemptId);

    if (!attempt || attempt.quiz !== id) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const quiz = await getQuiz(id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const isOwner = attempt.user.id === user.id;
    const isInstructorView = isInstructor(user.role, user.id, quiz.course.instructorId);
    if (!isOwner && !isInstructorView) {
      return NextResponse.json({ error: 'Not authorized to update this attempt' }, { status: 403 });
    }

    const payload = await request.json();
    const result = submitSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 });
    }

    const updated = await submitQuizAttempt({ attemptId, user, answers: result.data.answers });
    const doc =
      isOwner && user.role === 'student'
        ? maskAttemptForLearner(updated, {
            revealSolutions: updated.status !== 'inProgress' && quiz.allowReview,
            revealExplanations:
              updated.status !== 'inProgress' && quiz.allowReview && quiz.showExplanations,
          })
        : updated;

    return NextResponse.json({ doc });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to submit attempt' }, { status: 400 });
  }
}

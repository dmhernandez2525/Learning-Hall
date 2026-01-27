import { NextRequest, NextResponse } from 'next/server';
import { listQuizzes, createQuiz } from '@/lib/quizzes';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const courseId = searchParams.get('courseId') || undefined;
    const status = (searchParams.get('status') as 'draft' | 'published' | null) || undefined;
    const search = searchParams.get('search') || undefined;

    if (courseId) {
      const course = await getCourse(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      if (course.status !== 'published') {
        const user = await getSession();

        if (!user) {
          return NextResponse.json(
            { error: 'Course not found' },
            { status: 404 }
          );
        }

        if (user.role !== 'admin' && course.instructor.id !== user.id) {
          return NextResponse.json(
            { error: 'Course not found' },
            { status: 404 }
          );
        }
      }

      const result = await listQuizzes({ courseId, status, search });
      return NextResponse.json(result);
    }

    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await listQuizzes({
      page,
      limit,
      status,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List quizzes error:', error);
    return NextResponse.json(
      { error: 'Failed to list quizzes' },
      { status: 500 }
    );
  }
}

const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  courseId: z.string().min(1, 'Course ID is required'),
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

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only instructors can create quizzes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const course = await getCourse(result.data.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to add quizzes to this course' },
        { status: 403 }
      );
    }

    const quiz = await createQuiz(result.data);

    return NextResponse.json({ doc: quiz }, { status: 201 });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

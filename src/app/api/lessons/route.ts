import { NextRequest, NextResponse } from 'next/server';
import { listLessons, createLesson, getLessonsByModule } from '@/lib/lessons';
import { getModule } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const moduleId = searchParams.get('moduleId') || undefined;
    const contentType = searchParams.get('contentType') as
      | 'video'
      | 'text'
      | 'quiz'
      | 'assignment'
      | undefined;
    const isPreview = searchParams.get('isPreview');
    const sort = searchParams.get('sort') as 'position' | '-position' | undefined;

    // If moduleId is provided, return all lessons for that module sorted by position
    if (moduleId) {
      const lessons = await getLessonsByModule(moduleId);
      return NextResponse.json({ docs: lessons, totalDocs: lessons.length });
    }

    const result = await listLessons({
      page,
      limit,
      contentType,
      isPreview: isPreview === 'true' ? true : isPreview === 'false' ? false : undefined,
      sort: sort || 'position',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List lessons error:', error);
    return NextResponse.json(
      { error: 'Failed to list lessons' },
      { status: 500 }
    );
  }
}

const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  moduleId: z.string().min(1, 'Module ID is required'),
  position: z.number().min(0).optional(),
  contentType: z.enum(['video', 'text', 'quiz', 'assignment']),
  content: z
    .object({
      videoUrl: z.string().url().optional(),
      videoDuration: z.number().min(0).optional(),
      videoThumbnailId: z.string().optional(),
      textContent: z.unknown().optional(),
      quizData: z.unknown().optional(),
      assignmentInstructions: z.unknown().optional(),
    })
    .optional(),
  isPreview: z.boolean().optional(),
  estimatedDuration: z.number().min(0).optional(),
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
        { error: 'Only instructors can create lessons' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createLessonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the module exists and user has access
    const module = await getModule(result.data.moduleId);
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    const course = await getCourse(module.course.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to add lessons to this module' },
        { status: 403 }
      );
    }

    const lesson = await createLesson(result.data);

    return NextResponse.json({ doc: lesson }, { status: 201 });
  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}

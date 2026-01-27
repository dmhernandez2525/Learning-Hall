import { NextRequest, NextResponse } from 'next/server';
import { getLesson, updateLesson, deleteLesson } from '@/lib/lessons';
import { getModule } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const lesson = await getLesson(id);

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check if parent course is published, if not require auth
    const module = await getModule(lesson.module.id);
    if (module) {
      const course = await getCourse(module.course.id);
      if (course && course.status !== 'published') {
        const user = await getSession();

        if (!user) {
          return NextResponse.json(
            { error: 'Lesson not found' },
            { status: 404 }
          );
        }

        if (user.role !== 'admin' && course.instructor.id !== user.id) {
          return NextResponse.json(
            { error: 'Lesson not found' },
            { status: 404 }
          );
        }
      }
    }

    return NextResponse.json({ doc: lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to get lesson' },
      { status: 500 }
    );
  }
}

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().min(0).optional(),
  contentType: z.enum(['video', 'text', 'quiz', 'assignment']).optional(),
  content: z
    .object({
      videoUrl: z.string().url().optional().nullable(),
      videoDuration: z.number().min(0).optional().nullable(),
      videoThumbnailId: z.string().optional().nullable(),
      textContent: z.unknown().optional(),
      quizData: z.unknown().optional(),
      assignmentInstructions: z.unknown().optional(),
    })
    .optional(),
  isPreview: z.boolean().optional(),
  estimatedDuration: z.number().min(0).optional(),
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
    const lesson = await getLesson(id);

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const module = await getModule(lesson.module.id);
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
        { error: 'Not authorized to edit this lesson' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateLessonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Build update data with proper types
    const updateData: Parameters<typeof updateLesson>[1] = {};

    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.position !== undefined) updateData.position = result.data.position;
    if (result.data.contentType !== undefined) updateData.contentType = result.data.contentType;
    if (result.data.isPreview !== undefined) updateData.isPreview = result.data.isPreview;
    if (result.data.estimatedDuration !== undefined)
      updateData.estimatedDuration = result.data.estimatedDuration;

    if (result.data.content) {
      updateData.content = {};
      const c = result.data.content;
      if (c.videoUrl !== undefined && c.videoUrl !== null)
        updateData.content.videoUrl = c.videoUrl;
      if (c.videoDuration !== undefined && c.videoDuration !== null)
        updateData.content.videoDuration = c.videoDuration;
      if (c.videoThumbnailId !== undefined && c.videoThumbnailId !== null)
        updateData.content.videoThumbnailId = c.videoThumbnailId;
      if (c.textContent !== undefined) updateData.content.textContent = c.textContent;
      if (c.quizData !== undefined) updateData.content.quizData = c.quizData;
      if (c.assignmentInstructions !== undefined)
        updateData.content.assignmentInstructions = c.assignmentInstructions;
    }

    const updated = await updateLesson(id, updateData);

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
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
    const lesson = await getLesson(id);

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const module = await getModule(lesson.module.id);
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

    // Only admins and the course instructor can delete lessons
    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this lesson' },
        { status: 403 }
      );
    }

    const success = await deleteLesson(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete lesson' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}

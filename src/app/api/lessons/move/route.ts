import { NextRequest, NextResponse } from 'next/server';
import { moveLesson, getLesson } from '@/lib/lessons';
import { getModule } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const moveSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  newModuleId: z.string().min(1, 'New module ID is required'),
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
        { error: 'Only instructors can move lessons' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = moveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Get the lesson to verify it exists and get its current module
    const lesson = await getLesson(result.data.lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get the source module's course for authorization
    const sourceModule = await getModule(lesson.module.id);
    if (!sourceModule) {
      return NextResponse.json(
        { error: 'Source module not found' },
        { status: 404 }
      );
    }

    const sourceCourse = await getCourse(sourceModule.course.id);
    if (!sourceCourse) {
      return NextResponse.json(
        { error: 'Source course not found' },
        { status: 404 }
      );
    }

    // Get the target module for authorization
    const targetModule = await getModule(result.data.newModuleId);
    if (!targetModule) {
      return NextResponse.json(
        { error: 'Target module not found' },
        { status: 404 }
      );
    }

    const targetCourse = await getCourse(targetModule.course.id);
    if (!targetCourse) {
      return NextResponse.json(
        { error: 'Target course not found' },
        { status: 404 }
      );
    }

    // Check authorization for both source and target courses
    if (user.role !== 'admin') {
      if (sourceCourse.instructor.id !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized to move lessons from this course' },
          { status: 403 }
        );
      }
      if (targetCourse.instructor.id !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized to move lessons to this course' },
          { status: 403 }
        );
      }
    }

    const updated = await moveLesson(result.data.lessonId, result.data.newModuleId);

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('Move lesson error:', error);
    return NextResponse.json(
      { error: 'Failed to move lesson' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { reorderLessons } from '@/lib/lessons';
import { getModule } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  lessonOrder: z.array(
    z.object({
      id: z.string(),
      position: z.number().min(0),
    })
  ),
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
        { error: 'Only instructors can reorder lessons' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = reorderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check module/course authorization
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
        { error: 'Not authorized to reorder lessons in this module' },
        { status: 403 }
      );
    }

    const lessons = await reorderLessons(result.data.moduleId, result.data.lessonOrder);

    return NextResponse.json({ docs: lessons });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder lessons' },
      { status: 500 }
    );
  }
}

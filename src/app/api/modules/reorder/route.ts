import { NextRequest, NextResponse } from 'next/server';
import { reorderModules } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  moduleOrder: z.array(
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
        { error: 'Only instructors can reorder modules' },
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

    // Check course authorization
    const course = await getCourse(result.data.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to reorder modules in this course' },
        { status: 403 }
      );
    }

    const modules = await reorderModules(result.data.courseId, result.data.moduleOrder);

    return NextResponse.json({ docs: modules });
  } catch (error) {
    console.error('Reorder modules error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder modules' },
      { status: 500 }
    );
  }
}

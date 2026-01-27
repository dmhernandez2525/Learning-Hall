import { NextRequest, NextResponse } from 'next/server';
import { getModule, updateModule, deleteModule } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const courseModule = await getModule(id);

    if (!courseModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if parent course is published, if not require auth
    const course = await getCourse(courseModule.course.id);
    if (course && course.status !== 'published') {
      const user = await getSession();

      if (!user) {
        return NextResponse.json(
          { error: 'Module not found' },
          { status: 404 }
        );
      }

      if (user.role !== 'admin' && course.instructor.id !== user.id) {
        return NextResponse.json(
          { error: 'Module not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ doc: courseModule });
  } catch (error) {
    console.error('Get module error:', error);
    return NextResponse.json(
      { error: 'Failed to get module' },
      { status: 500 }
    );
  }
}

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  position: z.number().min(0).optional(),
  dripDelay: z.number().min(0).optional(),
  lessons: z.array(z.string()).optional(),
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
    const courseModule = await getModule(id);

    if (!courseModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this module's course
    const course = await getCourse(courseModule.course.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this module' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateModuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateModule(id, result.data);

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('Update module error:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
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
    const courseModule = await getModule(id);

    if (!courseModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this module
    const course = await getCourse(courseModule.course.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Only admins and the course instructor can delete modules
    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this module' },
        { status: 403 }
      );
    }

    const success = await deleteModule(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete module' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete module error:', error);
    return NextResponse.json(
      { error: 'Failed to delete module' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCourse, updateCourse, deleteCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const course = await getCourse(id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ doc: course });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Failed to get course' },
      { status: 500 }
    );
  }
}

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  price: z
    .object({
      amount: z.number().min(0),
      currency: z.enum(['USD', 'EUR', 'GBP']),
    })
    .optional(),
  settings: z
    .object({
      allowPreview: z.boolean().optional(),
      requireSequentialProgress: z.boolean().optional(),
      certificateEnabled: z.boolean().optional(),
    })
    .optional(),
  publishedAt: z.string().optional(),
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
    const course = await getCourse(id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this course
    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this course' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateCourseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateCourse(id, result.data);

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
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
    const course = await getCourse(id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Only admins can delete courses
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete courses' },
        { status: 403 }
      );
    }

    const success = await deleteCourse(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

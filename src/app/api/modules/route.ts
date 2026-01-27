import { NextRequest, NextResponse } from 'next/server';
import { listModules, createModule, getModulesByCourse } from '@/lib/modules';
import { getCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const courseId = searchParams.get('courseId') || undefined;
    const sort = searchParams.get('sort') as 'position' | '-position' | undefined;

    // If courseId is provided, return all modules for that course sorted by position
    if (courseId) {
      // Check if course exists and user has access
      const course = await getCourse(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      // Draft courses require authorization
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

      const modules = await getModulesByCourse(courseId);
      return NextResponse.json({ docs: modules, totalDocs: modules.length });
    }

    // Generic list requires authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await listModules({
      page,
      limit,
      sort: sort || 'position',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List modules error:', error);
    return NextResponse.json(
      { error: 'Failed to list modules' },
      { status: 500 }
    );
  }
}

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  courseId: z.string().min(1, 'Course ID is required'),
  position: z.number().min(0).optional(),
  dripDelay: z.number().min(0).optional(),
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
        { error: 'Only instructors can create modules' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createModuleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the course exists and user has access
    const course = await getCourse(result.data.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to add modules to this course' },
        { status: 403 }
      );
    }

    const courseModule = await createModule(result.data);

    return NextResponse.json({ doc: courseModule }, { status: 201 });
  } catch (error) {
    console.error('Create module error:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { listCourses, createCourse } from '@/lib/courses';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') as 'draft' | 'published' | 'archived' | null;
    const search = searchParams.get('search') || undefined;

    const result = await listCourses({
      page,
      limit,
      status: status || undefined,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List courses error:', error);
    return NextResponse.json(
      { error: 'Failed to list courses' },
      { status: 500 }
    );
  }
}

const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
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
        { error: 'Only instructors can create courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = createCourseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const course = await createCourse({
      ...result.data,
      instructorId: user.id,
    });

    return NextResponse.json({ doc: course }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

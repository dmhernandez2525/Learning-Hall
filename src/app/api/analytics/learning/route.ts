import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getLearningAnalytics } from '@/lib/advanced-analytics';
import { z } from 'zod';

const querySchema = z.object({
  courseId: z.string().optional(),
  tenantId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins and instructors can view learning analytics
    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      courseId: searchParams.get('courseId') || undefined,
      tenantId: searchParams.get('tenantId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, tenantId } = parsed.data;

    // Non-admin users can only see their tenant's data
    const effectiveTenantId =
      user.role === 'admin' ? tenantId : (user.tenant as string) || undefined;

    const analytics = await getLearningAnalytics(effectiveTenantId, courseId);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Learning analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning analytics' },
      { status: 500 }
    );
  }
}

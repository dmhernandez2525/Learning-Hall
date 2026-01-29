import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { trackClick, trackConversion } from '@/lib/search/analytics';

// POST /api/search/track - Track search interactions
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    const body = await request.json();
    const { action, query, courseId, position } = body;

    if (!action || !query) {
      return NextResponse.json(
        { error: 'action and query are required' },
        { status: 400 }
      );
    }

    const tenantId = user?.tenant as string | undefined;

    switch (action) {
      case 'click':
        if (!courseId || position === undefined) {
          return NextResponse.json(
            { error: 'courseId and position are required for click tracking' },
            { status: 400 }
          );
        }
        await trackClick({
          query,
          courseId,
          position,
          userId: user?.id,
          tenantId,
        });
        break;

      case 'conversion':
        if (!courseId || !user?.id) {
          return NextResponse.json(
            { error: 'courseId and authentication are required for conversion tracking' },
            { status: 400 }
          );
        }
        await trackConversion({
          query,
          courseId,
          userId: user.id,
          tenantId,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getInstructorEarnings } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only instructors and admins can view earnings
    if (!['admin', 'instructor'].includes(user.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const instructorId = searchParams.get('instructorId') || user.id;
    const days = parseInt(searchParams.get('days') || '30');

    // Non-admins can only view their own earnings
    if (user.role !== 'admin' && instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Cannot view other instructor earnings' },
        { status: 403 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const earnings = await getInstructorEarnings(instructorId, {
      dateRange: { startDate, endDate },
    });

    return NextResponse.json({
      ...earnings,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error('Instructor earnings error:', error);
    return NextResponse.json(
      { error: 'Failed to load instructor earnings' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getRevenueOverview,
  getRevenueByPeriod,
  getRevenueByProductType,
  getTopCoursesByRevenue,
  getSubscriptionMetrics,
} from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admin or instructor can view analytics
    if (!['admin', 'instructor'].includes(user.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') as 'day' | 'week' | 'month' || 'day';
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = { startDate, endDate };

    // Fetch all analytics data in parallel
    const [overview, byPeriod, byProductType, topCourses, subscriptionMetrics] = await Promise.all([
      getRevenueOverview({ dateRange }),
      getRevenueByPeriod({ period, dateRange }),
      getRevenueByProductType({ dateRange }),
      getTopCoursesByRevenue({ dateRange, limit: 10 }),
      getSubscriptionMetrics(),
    ]);

    return NextResponse.json({
      overview,
      byPeriod,
      byProductType,
      topCourses,
      subscriptionMetrics,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to load revenue analytics' },
      { status: 500 }
    );
  }
}

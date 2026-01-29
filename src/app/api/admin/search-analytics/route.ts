import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getSearchAnalyticsSummary,
  getZeroResultSearches,
  getLowCTRSearches,
} from '@/lib/search/analytics';

// GET /api/admin/search-analytics - Get search analytics (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const type = searchParams.get('type') || 'summary';

    const tenantId = user.tenant as string | undefined;

    switch (type) {
      case 'summary':
        const summary = await getSearchAnalyticsSummary(tenantId, days);
        return NextResponse.json({ summary });

      case 'zero-results':
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const zeroResults = await getZeroResultSearches(tenantId, limit);
        return NextResponse.json({ queries: zeroResults });

      case 'low-ctr':
        const ctrLimit = parseInt(searchParams.get('limit') || '20', 10);
        const minSearches = parseInt(searchParams.get('minSearches') || '10', 10);
        const lowCTR = await getLowCTRSearches(tenantId, minSearches, ctrLimit);
        return NextResponse.json({ queries: lowCTR });

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get search analytics' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTrendingSearches, getPopularSearches } from '@/lib/search/analytics';

// GET /api/search/trending - Get trending and popular searches
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'trending'; // 'trending' or 'popular'
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const tenantId = user?.tenant as string | undefined;

    let searches: { query: string; searchCount: number }[];

    if (type === 'popular') {
      searches = await getPopularSearches(tenantId, limit);
    } else {
      searches = await getTrendingSearches(tenantId, limit);
    }

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Trending searches error:', error);
    return NextResponse.json(
      { error: 'Failed to get trending searches' },
      { status: 500 }
    );
  }
}

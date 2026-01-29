import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  search,
  getSuggestions,
  getPopularSearches,
} from '@/lib/search';
import { trackSearch } from '@/lib/search/analytics';

// GET /api/search - Search courses and content
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('limit') || '20', 10);

    // Parse filters
    const filters: Record<string, unknown> = {};

    const category = searchParams.get('category');
    if (category) filters.category = category;

    const level = searchParams.get('level');
    if (level) filters.level = level;

    const isFree = searchParams.get('isFree');
    if (isFree === 'true') filters.isFree = true;

    const priceMin = searchParams.get('priceMin');
    if (priceMin) filters.priceMin = parseFloat(priceMin);

    const priceMax = searchParams.get('priceMax');
    if (priceMax) filters.priceMax = parseFloat(priceMax);

    const rating = searchParams.get('rating');
    if (rating) filters.rating = parseFloat(rating);

    const tenantId = user?.tenant as string | undefined;
    if (tenantId) filters.tenantId = tenantId;

    // Perform search
    const results = await search(query, filters, page, pageSize);

    // Track search (async, don't wait)
    if (query) {
      trackSearch({
        query,
        filters,
        resultsCount: results.total,
        userId: user?.id,
        tenantId,
      }).catch(console.error);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

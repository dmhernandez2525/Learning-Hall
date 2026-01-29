import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  search,
  getSuggestions,
  getPopularSearches,
} from '@/lib/search';
import { trackSearch } from '@/lib/search/analytics';

// Input validation helpers
function sanitizeString(input: string | null, maxLength: number = 200): string | undefined {
  if (!input) return undefined;
  // Remove any potential injection characters and limit length
  return input.slice(0, maxLength).replace(/[<>'"`;]/g, '');
}

function parsePositiveInt(input: string | null, defaultVal: number, max: number): number {
  if (!input) return defaultVal;
  const parsed = parseInt(input, 10);
  if (isNaN(parsed) || parsed < 1) return defaultVal;
  return Math.min(parsed, max);
}

function parsePositiveFloat(input: string | null, min: number, max: number): number | undefined {
  if (!input) return undefined;
  const parsed = parseFloat(input);
  if (isNaN(parsed) || parsed < min || parsed > max) return undefined;
  return parsed;
}

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

// GET /api/search - Search courses and content
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    // Validate and sanitize inputs
    const query = sanitizeString(searchParams.get('q'), 500) || '';
    const type = searchParams.get('type') || undefined;
    const page = parsePositiveInt(searchParams.get('page'), 1, 1000);
    const pageSize = parsePositiveInt(searchParams.get('limit'), 20, 100);

    // Parse and validate filters
    const filters: Record<string, unknown> = {};

    const category = sanitizeString(searchParams.get('category'), 100);
    if (category) filters.category = category;

    const level = searchParams.get('level');
    if (level && VALID_LEVELS.includes(level)) filters.level = level;

    const isFree = searchParams.get('isFree');
    if (isFree === 'true') filters.isFree = true;

    const priceMin = parsePositiveFloat(searchParams.get('priceMin'), 0, 100000);
    if (priceMin !== undefined) filters.priceMin = priceMin;

    const priceMax = parsePositiveFloat(searchParams.get('priceMax'), 0, 100000);
    if (priceMax !== undefined) filters.priceMax = priceMax;

    const rating = parsePositiveFloat(searchParams.get('rating'), 0, 5);
    if (rating !== undefined) filters.rating = rating;

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

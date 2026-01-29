import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getDiscoverySections,
  getCategories,
  getLevels,
  getPriceRanges,
  getTopInstructors,
} from '@/lib/search/discovery';

// GET /api/discover - Get discovery page sections
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    const tenantId = user?.tenant as string | undefined;
    const includeFilters = searchParams.get('includeFilters') === 'true';

    // Get discovery sections
    const sections = await getDiscoverySections(user?.id, tenantId);

    const response: Record<string, unknown> = { sections };

    // Include filter options if requested
    if (includeFilters) {
      const [categories, levels, priceRanges] = await Promise.all([
        getCategories(tenantId),
        getLevels(tenantId),
        getPriceRanges(tenantId),
      ]);

      response.filters = {
        categories,
        levels,
        priceRanges,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to load discovery page' },
      { status: 500 }
    );
  }
}

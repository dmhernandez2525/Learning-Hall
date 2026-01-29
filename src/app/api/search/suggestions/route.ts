import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSuggestions } from '@/lib/search';

// GET /api/search/suggestions - Get search autocomplete suggestions
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const tenantId = user?.tenant as string | undefined;
    const suggestions = await getSuggestions(query, tenantId, limit);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

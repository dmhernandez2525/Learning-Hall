import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCategories } from '@/lib/search/discovery';

// GET /api/discover/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const tenantId = user?.tenant as string | undefined;

    const categories = await getCategories(tenantId);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories error:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
}

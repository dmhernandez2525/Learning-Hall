import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listFavoriteCourses } from '@/lib/favorites';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '12', 10);
    const favorites = await listFavoriteCourses(user.id, limit);
    return NextResponse.json({ docs: favorites });
  } catch (error) {
    console.error('List favorites error', error);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

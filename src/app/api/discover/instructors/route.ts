import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTopInstructors } from '@/lib/search/discovery';

// GET /api/discover/instructors - Get top instructors
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const tenantId = user?.tenant as string | undefined;

    const instructors = await getTopInstructors(tenantId, limit);

    return NextResponse.json({ instructors });
  } catch (error) {
    console.error('Instructors error:', error);
    return NextResponse.json(
      { error: 'Failed to load instructors' },
      { status: 500 }
    );
  }
}

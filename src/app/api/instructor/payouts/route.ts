import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'instructor'].includes(user.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const instructorId = searchParams.get('instructorId') || user.id;

    // Non-admins can only view their own payouts
    if (user.role !== 'admin' && instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Cannot view other instructor payouts' },
        { status: 403 }
      );
    }

    const { docs, totalPages, totalDocs } = await payload.find({
      collection: 'instructor-payouts',
      where: { instructor: { equals: instructorId } },
      sort: '-createdAt',
      page,
      limit,
      depth: 2,
    });

    // Calculate summary stats
    const completedPayouts = docs.filter(p => p.status === 'completed');
    const pendingPayouts = docs.filter(p => p.status === 'pending');
    const totalPaid = completedPayouts.reduce((sum, p) => sum + (p.earnings?.net || 0), 0);
    const totalPending = pendingPayouts.reduce((sum, p) => sum + (p.earnings?.net || 0), 0);

    return NextResponse.json({
      payouts: docs,
      pagination: {
        page,
        limit,
        totalPages,
        totalDocs,
      },
      summary: {
        totalPaid,
        totalPending,
        completedCount: completedPayouts.length,
        pendingCount: pendingPayouts.length,
      },
    });
  } catch (error) {
    console.error('Instructor payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to load instructor payouts' },
      { status: 500 }
    );
  }
}

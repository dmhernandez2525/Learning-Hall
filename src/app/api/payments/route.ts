import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserPayments, getRevenueStats } from '@/lib/payments';

/**
 * GET /api/payments
 * Get user's payment history or revenue stats (admin)
 */
export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
  const type = searchParams.get('type') || undefined;
  const status = searchParams.get('status') || undefined;
  const scope = searchParams.get('scope') || 'user';

  // Revenue stats are admin-only
  if (scope === 'stats') {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const stats = await getRevenueStats({ startDate, endDate });
    return NextResponse.json(stats);
  }

  // Get user's payment history
  const result = await getUserPayments(user.id, { page, limit, type, status });

  return NextResponse.json({
    payments: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  });
}

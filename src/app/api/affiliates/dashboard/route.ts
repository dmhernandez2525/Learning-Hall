import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAffiliateDashboard } from '@/lib/affiliates';

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const dashboard = await getAffiliateDashboard(user.id);

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Affiliate account not found', notAffiliate: true },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Affiliate dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load affiliate dashboard' },
      { status: 500 }
    );
  }
}

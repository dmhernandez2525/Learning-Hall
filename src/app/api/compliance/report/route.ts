import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getComplianceReport } from '@/lib/compliance';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(request.url);
    const orgId = url.searchParams.get('orgId') ?? undefined;
    const doc = await getComplianceReport(orgId);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load report' },
      { status: 400 }
    );
  }
}

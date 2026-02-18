import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSecurityAnalytics } from '@/lib/security';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') ?? undefined;

  try {
    const doc = await getSecurityAnalytics(orgId);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

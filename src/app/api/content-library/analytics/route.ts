import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getContentLibraryAnalytics } from '@/lib/content-library';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') ?? undefined;

  try {
    const doc = await getContentLibraryAnalytics(orgId);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

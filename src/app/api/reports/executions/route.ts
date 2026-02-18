import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listExecutions } from '@/lib/reporting';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('reportId') ?? undefined;

  const docs = await listExecutions(reportId);
  return NextResponse.json({ docs });
}

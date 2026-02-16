import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listScreenReaderConfigs } from '@/lib/accessibility';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId') ?? undefined;
  const docs = await listScreenReaderConfigs(courseId);
  return NextResponse.json({ docs });
}

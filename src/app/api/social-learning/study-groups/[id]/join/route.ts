import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { joinStudyGroup } from '@/lib/social-learning';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const doc = await joinStudyGroup(id, user);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join group';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

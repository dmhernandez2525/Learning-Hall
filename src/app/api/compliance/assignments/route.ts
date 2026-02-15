import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listAssignmentsForUser } from '@/lib/compliance';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const docs = await listAssignmentsForUser(user.id);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list assignments' },
      { status: 400 }
    );
  }
}

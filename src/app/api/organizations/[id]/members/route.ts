import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listMembers, addMember } from '@/lib/organizations';

type RouteParams = { params: Promise<{ id: string }> };

const createSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['owner', 'admin', 'manager', 'member']).optional(),
  departmentId: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const docs = await listMembers(id);
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list members' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await addMember(
      id,
      parsed.data.userId,
      parsed.data.role ?? 'member',
      parsed.data.departmentId,
      user
    );
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
      { status: 400 }
    );
  }
}

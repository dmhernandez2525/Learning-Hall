import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { bulkProvisionUsers } from '@/lib/organizations';

type RouteParams = { params: Promise<{ id: string }> };

const bulkSchema = z.object({
  users: z.array(
    z.object({
      email: z.string().email(),
      name: z.string().min(1).max(200),
      role: z.enum(['owner', 'admin', 'manager', 'member']).optional(),
      departmentId: z.string().optional(),
    })
  ).min(1).max(500),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await bulkProvisionUsers(id, parsed.data.users, user);
    return NextResponse.json({ doc: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to provision users' },
      { status: 400 }
    );
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { executeReport } from '@/lib/reporting';

type RouteParams = { params: Promise<{ id: string }> };

const executeSchema = z.object({
  exportFormat: z.enum(['csv', 'json', 'pdf']).default('csv'),
});

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = executeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const doc = await executeReport(id, parsed.data.exportFormat, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to execute report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

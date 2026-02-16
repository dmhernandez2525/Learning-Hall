import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getReportDefinition, updateReportDefinition } from '@/lib/reporting';

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  reportType: z.enum(['enrollment', 'completion', 'compliance', 'revenue', 'engagement', 'custom']).optional(),
  columns: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    dataType: z.enum(['string', 'number', 'date', 'boolean']),
    sortable: z.boolean(),
  })).optional(),
  filters: z.array(z.object({
    field: z.string().min(1),
    operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'between', 'in']),
    value: z.string(),
  })).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
}).strict();

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const doc = await getReportDefinition(id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ doc });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const doc = await updateReportDefinition(id, parsed.data);
    return NextResponse.json({ doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

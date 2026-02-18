import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listReportDefinitions, createReportDefinition } from '@/lib/reporting';

const columnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  dataType: z.enum(['string', 'number', 'date', 'boolean']),
  sortable: z.boolean(),
});

const filterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'between', 'in']),
  value: z.string(),
});

const scheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  hour: z.number().min(0).max(23),
  exportFormat: z.enum(['csv', 'json', 'pdf']),
  recipients: z.array(z.string().email()),
});

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  organizationId: z.string().min(1),
  reportType: z.enum(['enrollment', 'completion', 'compliance', 'revenue', 'engagement', 'custom']),
  columns: z.array(columnSchema).min(1),
  filters: z.array(filterSchema).optional(),
  schedule: scheduleSchema.nullable().optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') ?? undefined;

  const docs = await listReportDefinitions(orgId);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'instructor'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const doc = await createReportDefinition(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

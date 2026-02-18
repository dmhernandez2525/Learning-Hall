import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listSavedSearches, saveSearch } from '@/lib/advanced-search';

const filterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'contains', 'gt', 'lt']),
  value: z.string(),
});

const createSchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
  filters: z.array(filterSchema).optional(),
  resultCount: z.number().optional(),
});

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const docs = await listSavedSearches(user.id);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await saveSearch(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save search';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

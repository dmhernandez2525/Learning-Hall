import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { bulkImportUsers } from '@/lib/user-management';

const importSchema = z.object({
  users: z.array(z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.string().optional(),
  })).min(1).max(500),
});

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const result = await bulkImportUsers(parsed.data.users, user.tenant);
    return NextResponse.json({ doc: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

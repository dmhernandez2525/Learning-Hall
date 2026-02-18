import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listKeyboardAudits, createKeyboardAudit } from '@/lib/accessibility';

const createSchema = z.object({
  pageUrl: z.string().min(1),
  tabOrder: z.array(z.string()),
  trappedElements: z.array(z.string()).optional(),
  missingFocus: z.array(z.string()).optional(),
  passed: z.boolean(),
});

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const docs = await listKeyboardAudits();
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
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createKeyboardAudit(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create keyboard audit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

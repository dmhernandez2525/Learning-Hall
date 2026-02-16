import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDigestConfig, upsertDigestConfig } from '@/lib/notifications';

const upsertSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  isEnabled: z.boolean(),
});

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await getDigestConfig(user.id);
  return NextResponse.json({ doc });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await upsertDigestConfig(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save digest config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

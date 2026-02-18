import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listNotifications, createNotification, markAllRead } from '@/lib/notifications';

const createSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['info', 'success', 'warning', 'alert']),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? undefined;
  const markAll = searchParams.get('markAllRead');

  if (markAll === 'true' && userId) {
    const count = await markAllRead(userId);
    return NextResponse.json({ markedRead: count });
  }

  const docs = await listNotifications(userId);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createNotification(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

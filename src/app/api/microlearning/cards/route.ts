import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listCards, createCard, getNextDueCards } from '@/lib/microlearning';

const createSchema = z.object({
  lessonId: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId') ?? undefined;
  const due = searchParams.get('due');

  if (due === 'true') {
    const docs = await getNextDueCards();
    return NextResponse.json({ docs });
  }

  const docs = await listCards(lessonId);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createCard(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create card';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

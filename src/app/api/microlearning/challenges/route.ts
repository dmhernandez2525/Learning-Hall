import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listChallenges, createChallenge } from '@/lib/microlearning';

const questionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().min(0),
});

const createSchema = z.object({
  title: z.string().min(1),
  questions: z.array(questionSchema).min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.number().min(0),
  activeDate: z.string().min(1),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty') ?? undefined;
  const docs = await listChallenges(difficulty);
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
    const doc = await createChallenge(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create challenge';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

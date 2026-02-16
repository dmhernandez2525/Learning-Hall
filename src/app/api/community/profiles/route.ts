import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listProfiles, upsertProfile } from '@/lib/community';

const upsertSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().optional(),
  interests: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('publicOnly') === 'true';
  const docs = await listProfiles(publicOnly || undefined);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await upsertProfile(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

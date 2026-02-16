import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { listSSOConfigs, createSSOConfig } from '@/lib/security';

const createSchema = z.object({
  organizationId: z.string().min(1),
  provider: z.enum(['saml', 'oidc']),
  name: z.string().min(1).max(200),
  issuerUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().optional(),
  metadataUrl: z.string().url().optional(),
  redirectUrl: z.string().url(),
});

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') ?? undefined;
  const docs = await listSSOConfigs(orgId);
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await createSSOConfig(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create SSO config';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

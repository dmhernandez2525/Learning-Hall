import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getListing, updateListing } from '@/lib/marketplace';

type RouteParams = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  price: z.number().min(0).optional(),
  licenseType: z.enum(['single-use', 'unlimited', 'time-limited']).optional(),
  licenseDurationDays: z.number().int().min(1).optional(),
  status: z.enum(['draft', 'active', 'suspended', 'archived']).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  previewUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const doc = await getListing(id);
    if (!doc) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load listing' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await updateListing(id, parsed.data);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update listing' },
      { status: 400 }
    );
  }
}

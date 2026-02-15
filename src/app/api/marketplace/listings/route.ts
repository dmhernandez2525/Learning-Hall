import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { listMarketplaceItems, createListing } from '@/lib/marketplace';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  courseId: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().max(3).optional(),
  licenseType: z.enum(['single-use', 'unlimited', 'time-limited']).optional(),
  licenseDurationDays: z.number().int().min(1).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  previewUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') ?? undefined;
    const search = url.searchParams.get('search') ?? undefined;
    const sellerId = url.searchParams.get('sellerId') ?? undefined;

    const docs = await listMarketplaceItems({ category, search, sellerId });
    return NextResponse.json({ docs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list marketplace items' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await createListing(parsed.data, user);
    return NextResponse.json({ doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create listing' },
      { status: 400 }
    );
  }
}

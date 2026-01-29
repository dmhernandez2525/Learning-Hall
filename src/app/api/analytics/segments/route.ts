import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserSegments } from '@/lib/advanced-analytics';
import { z } from 'zod';

const querySchema = z.object({
  tenantId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can view user segments
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      tenantId: searchParams.get('tenantId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId } = parsed.data;

    const segments = await getUserSegments(tenantId);

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('User segments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user segments' },
      { status: 500 }
    );
  }
}

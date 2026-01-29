import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCohortData } from '@/lib/advanced-analytics';
import { z } from 'zod';

const querySchema = z.object({
  months: z.coerce.number().min(1).max(12).optional(),
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

    // Only admins can view cohort analytics
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      months: searchParams.get('months') || undefined,
      tenantId: searchParams.get('tenantId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { months = 6, tenantId } = parsed.data;

    const cohorts = await getCohortData(tenantId, months);

    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error('Analytics cohort error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort data' },
      { status: 500 }
    );
  }
}

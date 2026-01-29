import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { validateCoupon } from '@/lib/coupons';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().min(1),
  purchaseAmount: z.number().positive(),
  purchaseType: z.enum(['course', 'subscription', 'bundle']),
  itemId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = validateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const validation = await validateCoupon({
      code: result.data.code,
      userId: user.id,
      purchaseAmount: result.data.purchaseAmount,
      purchaseType: result.data.purchaseType,
      itemId: result.data.itemId,
    });

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

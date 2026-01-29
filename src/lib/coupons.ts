import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@/payload.config';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscountAmount?: number;
    description?: string;
  };
  discountAmount?: number;
  error?: string;
}

export interface ApplyCouponInput {
  code: string;
  userId: string;
  purchaseAmount: number;
  purchaseType: 'course' | 'subscription' | 'bundle';
  itemId?: string;
}

/**
 * Validate a coupon code
 */
export async function validateCoupon(input: ApplyCouponInput): Promise<CouponValidationResult> {
  const payload = await getPayload({ config });
  const code = input.code.toUpperCase().trim();

  // Find the coupon
  const { docs: coupons } = await payload.find({
    collection: 'coupons',
    where: {
      and: [
        { code: { equals: code } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
  });

  if (coupons.length === 0) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  const coupon = coupons[0];

  // Check validity dates
  const now = new Date();
  if (coupon.validity?.startsAt && new Date(coupon.validity.startsAt) > now) {
    return { valid: false, error: 'This coupon is not yet active' };
  }
  if (coupon.validity?.expiresAt && new Date(coupon.validity.expiresAt) < now) {
    return { valid: false, error: 'This coupon has expired' };
  }

  // Check max redemptions
  if (coupon.restrictions?.maxRedemptions) {
    const timesRedeemed = coupon.stats?.timesRedeemed || 0;
    if (timesRedeemed >= coupon.restrictions.maxRedemptions) {
      return { valid: false, error: 'This coupon has reached its maximum redemptions' };
    }
  }

  // Check per-user redemptions
  if (coupon.restrictions?.maxRedemptionsPerUser) {
    const { docs: userRedemptions } = await payload.find({
      collection: 'payments',
      where: {
        and: [
          { user: { equals: input.userId } },
          { 'coupon.code': { equals: code } },
        ],
      },
      limit: 1,
    });

    if (userRedemptions.length >= coupon.restrictions.maxRedemptionsPerUser) {
      return { valid: false, error: 'You have already used this coupon' };
    }
  }

  // Check first purchase only
  if (coupon.restrictions?.firstPurchaseOnly) {
    const { docs: userPayments } = await payload.find({
      collection: 'payments',
      where: {
        and: [
          { user: { equals: input.userId } },
          { status: { equals: 'succeeded' } },
        ],
      },
      limit: 1,
    });

    if (userPayments.length > 0) {
      return { valid: false, error: 'This coupon is only valid for first-time purchases' };
    }
  }

  // Check new users only
  if (coupon.restrictions?.newUsersOnly) {
    const user = await payload.findByID({
      collection: 'users',
      id: input.userId,
    });

    if (user) {
      const accountAge = Date.now() - new Date(user.createdAt as string).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (accountAge > sevenDays) {
        return { valid: false, error: 'This coupon is only valid for new accounts' };
      }
    }
  }

  // Check applies to
  const appliesTo = coupon.appliesTo?.type || 'all';
  if (appliesTo === 'courses' && input.purchaseType !== 'course') {
    return { valid: false, error: 'This coupon is only valid for courses' };
  }
  if (appliesTo === 'subscriptions' && input.purchaseType !== 'subscription') {
    return { valid: false, error: 'This coupon is only valid for subscriptions' };
  }
  if (appliesTo === 'bundles' && input.purchaseType !== 'bundle') {
    return { valid: false, error: 'This coupon is only valid for course bundles' };
  }

  // Check specific courses
  if (appliesTo === 'courses' && coupon.appliesTo?.courses && input.itemId) {
    const validCourses = coupon.appliesTo.courses.map((c: { id?: string } | string) =>
      typeof c === 'object' ? c.id : c
    );
    if (!validCourses.includes(input.itemId)) {
      return { valid: false, error: 'This coupon is not valid for this course' };
    }
  }

  // Check minimum purchase amount
  if (coupon.minPurchaseAmount && input.purchaseAmount < coupon.minPurchaseAmount) {
    const minAmount = (coupon.minPurchaseAmount / 100).toFixed(2);
    return { valid: false, error: `Minimum purchase of $${minAmount} required` };
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = Math.round(input.purchaseAmount * (coupon.discountValue / 100));
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, input.purchaseAmount);
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || undefined,
      description: coupon.description || undefined,
    },
    discountAmount,
  };
}

/**
 * Record coupon usage
 */
export async function recordCouponUsage(
  couponId: string,
  discountAmount: number
): Promise<void> {
  const payload = await getPayload({ config });

  const coupon = await payload.findByID({
    collection: 'coupons',
    id: couponId,
  });

  if (!coupon) return;

  await payload.update({
    collection: 'coupons',
    id: couponId,
    data: {
      stats: {
        timesRedeemed: (coupon.stats?.timesRedeemed || 0) + 1,
        totalDiscountGiven: (coupon.stats?.totalDiscountGiven || 0) + discountAmount,
        lastUsedAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Get coupon statistics
 */
export async function getCouponStats(couponId: string) {
  const payload = await getPayload({ config });

  const coupon = await payload.findByID({
    collection: 'coupons',
    id: couponId,
  });

  if (!coupon) return null;

  return {
    code: coupon.code,
    timesRedeemed: coupon.stats?.timesRedeemed || 0,
    totalDiscountGiven: coupon.stats?.totalDiscountGiven || 0,
    lastUsedAt: coupon.stats?.lastUsedAt,
    maxRedemptions: coupon.restrictions?.maxRedemptions,
    isActive: coupon.isActive,
    expiresAt: coupon.validity?.expiresAt,
  };
}

/**
 * List all coupons with stats (admin)
 */
export async function listCoupons(options?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
  tenantId?: string;
}) {
  const payload = await getPayload({ config });

  const conditions: Where[] = [];

  if (options?.isActive !== undefined) {
    conditions.push({ isActive: { equals: options.isActive } });
  }

  if (options?.tenantId) {
    conditions.push({ tenant: { equals: options.tenantId } });
  }

  return payload.find({
    collection: 'coupons',
    where: conditions.length > 0 ? { and: conditions } : {},
    page: options?.page || 1,
    limit: options?.limit || 20,
    sort: '-createdAt',
  });
}

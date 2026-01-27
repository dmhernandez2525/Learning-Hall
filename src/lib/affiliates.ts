import { getPayload } from 'payload';
import config from '@/payload.config';

const DEFAULT_COOKIE_DAYS = 30;
const DEFAULT_HOLD_DAYS = 30;

/**
 * Track an affiliate click
 */
export async function trackAffiliateClick(options: {
  affiliateCode: string;
  customLink?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}) {
  const payload = await getPayload({ config });

  // Find affiliate by code
  const { docs: affiliates } = await payload.find({
    collection: 'affiliates',
    where: {
      and: [
        { code: { equals: options.affiliateCode.toUpperCase() } },
        { status: { equals: 'active' } },
      ],
    },
    limit: 1,
  });

  if (affiliates.length === 0) {
    return null;
  }

  const affiliate = affiliates[0];
  const cookieDays = affiliate.attribution?.cookieDays || DEFAULT_COOKIE_DAYS;
  const cookieExpiresAt = new Date();
  cookieExpiresAt.setDate(cookieExpiresAt.getDate() + cookieDays);

  // Create referral record
  const referral = await payload.create({
    collection: 'affiliate-referrals',
    data: {
      affiliate: affiliate.id,
      status: 'clicked',
      tracking: {
        referralCode: options.affiliateCode.toUpperCase(),
        customLink: options.customLink,
        landingPage: options.landingPage,
        utmSource: options.utmSource,
        utmMedium: options.utmMedium,
        utmCampaign: options.utmCampaign,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        referrer: options.referrer,
      },
      clickedAt: new Date().toISOString(),
      cookieExpiresAt: cookieExpiresAt.toISOString(),
    },
  });

  // Update affiliate stats
  await payload.update({
    collection: 'affiliates',
    id: affiliate.id,
    data: {
      stats: {
        ...affiliate.stats,
        totalReferrals: (affiliate.stats?.totalReferrals || 0) + 1,
        lastReferralAt: new Date().toISOString(),
      },
    },
  });

  // Update custom link clicks if applicable
  if (options.customLink && affiliate.customLinks) {
    const linkIndex = affiliate.customLinks.findIndex(
      (l: { slug: string }) => l.slug === options.customLink
    );
    if (linkIndex >= 0) {
      const updatedLinks = [...affiliate.customLinks];
      updatedLinks[linkIndex] = {
        ...updatedLinks[linkIndex],
        clicks: (updatedLinks[linkIndex].clicks || 0) + 1,
      };
      await payload.update({
        collection: 'affiliates',
        id: affiliate.id,
        data: { customLinks: updatedLinks },
      });
    }
  }

  return {
    referralId: referral.id,
    affiliateCode: affiliate.code,
    cookieExpiresAt,
  };
}

/**
 * Record a signup from affiliate referral
 */
export async function trackAffiliateSignup(referralId: string, userId: string) {
  const payload = await getPayload({ config });

  const referral = await payload.findByID({
    collection: 'affiliate-referrals',
    id: referralId,
  });

  if (!referral || referral.status !== 'clicked') {
    return null;
  }

  // Check cookie expiration
  if (referral.cookieExpiresAt && new Date(referral.cookieExpiresAt) < new Date()) {
    return null;
  }

  return payload.update({
    collection: 'affiliate-referrals',
    id: referralId,
    data: {
      referredUser: userId,
      status: 'signed_up',
      signedUpAt: new Date().toISOString(),
    },
  });
}

/**
 * Record a conversion (purchase) from affiliate referral
 */
export async function trackAffiliateConversion(options: {
  referralId?: string;
  userId?: string;
  affiliateCode?: string;
  paymentId: string;
  purchaseType: 'course' | 'bundle' | 'subscription';
  purchaseId: string;
  amount: number;
}) {
  const payload = await getPayload({ config });

  let referral;

  // Find referral by ID or by user + affiliate code
  if (options.referralId) {
    referral = await payload.findByID({
      collection: 'affiliate-referrals',
      id: options.referralId,
    });
  } else if (options.userId) {
    // Look for recent referral for this user
    const { docs } = await payload.find({
      collection: 'affiliate-referrals',
      where: {
        and: [
          { referredUser: { equals: options.userId } },
          { status: { in: ['clicked', 'signed_up'] } },
          { cookieExpiresAt: { greater_than: new Date().toISOString() } },
        ],
      },
      sort: '-clickedAt',
      limit: 1,
    });
    referral = docs[0];
  }

  if (!referral) {
    return null;
  }

  // Get affiliate to determine commission rate
  const affiliate = await payload.findByID({
    collection: 'affiliates',
    id: typeof referral.affiliate === 'string' ? referral.affiliate : referral.affiliate.id,
  });

  if (!affiliate || affiliate.status !== 'active') {
    return null;
  }

  // Calculate commission
  const rateKey = options.purchaseType === 'course' ? 'courses' :
    options.purchaseType === 'bundle' ? 'bundles' : 'subscriptions';
  const commissionRate = affiliate.commissionRates?.[rateKey] || 20;
  const commissionAmount = Math.round(options.amount * (commissionRate / 100));

  // Calculate clear date
  const clearsAt = new Date();
  clearsAt.setDate(clearsAt.getDate() + DEFAULT_HOLD_DAYS);

  // Update referral
  const updatedReferral = await payload.update({
    collection: 'affiliate-referrals',
    id: referral.id,
    data: {
      status: 'converted',
      payment: options.paymentId,
      purchase: {
        type: options.purchaseType,
        course: options.purchaseType === 'course' ? options.purchaseId : undefined,
        bundle: options.purchaseType === 'bundle' ? options.purchaseId : undefined,
        subscriptionPlan: options.purchaseType === 'subscription' ? options.purchaseId : undefined,
        amount: options.amount,
      },
      commission: {
        rate: commissionRate,
        amount: commissionAmount,
        status: 'pending',
        clearsAt: clearsAt.toISOString(),
      },
      convertedAt: new Date().toISOString(),
    },
  });

  // Update affiliate balance and stats
  const currentPending = affiliate.balance?.pending || 0;
  const currentLifetime = affiliate.balance?.lifetime || 0;
  const convertedReferrals = affiliate.stats?.convertedReferrals || 0;
  const totalRevenue = affiliate.stats?.totalRevenue || 0;
  const totalReferrals = affiliate.stats?.totalReferrals || 1;

  await payload.update({
    collection: 'affiliates',
    id: affiliate.id,
    data: {
      balance: {
        ...affiliate.balance,
        pending: currentPending + commissionAmount,
        lifetime: currentLifetime + commissionAmount,
      },
      stats: {
        ...affiliate.stats,
        convertedReferrals: convertedReferrals + 1,
        totalRevenue: totalRevenue + options.amount,
        conversionRate: Math.round(((convertedReferrals + 1) / totalReferrals) * 100),
      },
    },
  });

  return {
    referralId: updatedReferral.id,
    commissionAmount,
    clearsAt,
  };
}

/**
 * Process cleared commissions (move from pending to available)
 */
export async function processClearedCommissions() {
  const payload = await getPayload({ config });

  // Find all referrals with commissions that should clear
  const { docs: referrals } = await payload.find({
    collection: 'affiliate-referrals',
    where: {
      and: [
        { 'commission.status': { equals: 'pending' } },
        { 'commission.clearsAt': { less_than_equal: new Date().toISOString() } },
      ],
    },
    limit: 1000,
  });

  const results = [];

  for (const referral of referrals) {
    const affiliateId = typeof referral.affiliate === 'string'
      ? referral.affiliate
      : referral.affiliate?.id;

    if (!affiliateId) continue;

    const affiliate = await payload.findByID({
      collection: 'affiliates',
      id: affiliateId,
    });

    if (!affiliate) continue;

    const commissionAmount = referral.commission?.amount || 0;
    const currentAvailable = affiliate.balance?.available || 0;
    const currentPending = affiliate.balance?.pending || 0;

    // Update affiliate balance
    await payload.update({
      collection: 'affiliates',
      id: affiliateId,
      data: {
        balance: {
          ...affiliate.balance,
          available: currentAvailable + commissionAmount,
          pending: Math.max(0, currentPending - commissionAmount),
        },
      },
    });

    // Update referral commission status
    await payload.update({
      collection: 'affiliate-referrals',
      id: referral.id,
      data: {
        commission: {
          ...referral.commission,
          status: 'cleared',
        },
      },
    });

    results.push({
      referralId: referral.id,
      affiliateId,
      amount: commissionAmount,
    });
  }

  return results;
}

/**
 * Create a payout for an affiliate
 */
export async function createAffiliatePayout(affiliateId: string, processedBy: string) {
  const payload = await getPayload({ config });

  const affiliate = await payload.findByID({
    collection: 'affiliates',
    id: affiliateId,
  });

  if (!affiliate) {
    throw new Error('Affiliate not found');
  }

  const availableBalance = affiliate.balance?.available || 0;
  const minimumPayout = affiliate.payout?.minimumPayout || 5000;

  if (availableBalance < minimumPayout) {
    throw new Error(`Available balance (${availableBalance}) below minimum payout (${minimumPayout})`);
  }

  if (!affiliate.payout?.method) {
    throw new Error('Affiliate has not set up payout method');
  }

  // Get cleared referrals not yet paid
  const { docs: referrals } = await payload.find({
    collection: 'affiliate-referrals',
    where: {
      and: [
        { affiliate: { equals: affiliateId } },
        { 'commission.status': { equals: 'cleared' } },
      ],
    },
    limit: 1000,
  });

  if (referrals.length === 0) {
    throw new Error('No cleared commissions to pay');
  }

  // Calculate period
  const dates = referrals.map(r => new Date(r.convertedAt || r.createdAt));
  const periodStart = new Date(Math.min(...dates.map(d => d.getTime())));
  const periodEnd = new Date(Math.max(...dates.map(d => d.getTime())));

  // Create payout record
  const payout = await payload.create({
    collection: 'affiliate-payouts',
    data: {
      affiliate: affiliateId,
      amount: availableBalance,
      currency: 'usd',
      status: 'pending',
      method: affiliate.payout.method,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      breakdown: {
        grossAmount: availableBalance,
        fees: 0,
        adjustments: 0,
        referralCount: referrals.length,
      },
      paymentDetails: {
        paypalEmail: affiliate.payout.paypalEmail,
      },
      processedBy,
    },
  });

  // Update referrals with payout reference
  for (const referral of referrals) {
    await payload.update({
      collection: 'affiliate-referrals',
      id: referral.id,
      data: {
        commission: {
          ...referral.commission,
          status: 'paid',
          paidAt: new Date().toISOString(),
          payout: payout.id,
        },
      },
    });
  }

  // Reset affiliate available balance
  await payload.update({
    collection: 'affiliates',
    id: affiliateId,
    data: {
      balance: {
        ...affiliate.balance,
        available: 0,
      },
    },
  });

  return payout;
}

/**
 * Get affiliate dashboard data
 */
export async function getAffiliateDashboard(userId: string) {
  const payload = await getPayload({ config });

  // Get affiliate
  const { docs: affiliates } = await payload.find({
    collection: 'affiliates',
    where: { user: { equals: userId } },
    limit: 1,
  });

  if (affiliates.length === 0) {
    return null;
  }

  const affiliate = affiliates[0];

  // Get recent referrals
  const { docs: recentReferrals } = await payload.find({
    collection: 'affiliate-referrals',
    where: { affiliate: { equals: affiliate.id } },
    sort: '-createdAt',
    limit: 10,
    depth: 1,
  });

  // Get recent payouts
  const { docs: recentPayouts } = await payload.find({
    collection: 'affiliate-payouts',
    where: { affiliate: { equals: affiliate.id } },
    sort: '-createdAt',
    limit: 5,
  });

  // Get this month's stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { docs: monthReferrals } = await payload.find({
    collection: 'affiliate-referrals',
    where: {
      and: [
        { affiliate: { equals: affiliate.id } },
        { createdAt: { greater_than_equal: startOfMonth.toISOString() } },
      ],
    },
    limit: 1000,
  });

  const monthlyStats = {
    clicks: monthReferrals.length,
    signups: monthReferrals.filter(r => r.status !== 'clicked').length,
    conversions: monthReferrals.filter(r =>
      ['converted', 'paid'].includes(r.status || '')
    ).length,
    earnings: monthReferrals.reduce(
      (sum, r) => sum + (r.commission?.amount || 0),
      0
    ),
  };

  return {
    affiliate: {
      code: affiliate.code,
      tier: affiliate.tier,
      status: affiliate.status,
      commissionRates: affiliate.commissionRates,
    },
    balance: affiliate.balance,
    stats: affiliate.stats,
    monthlyStats,
    customLinks: affiliate.customLinks,
    recentReferrals,
    recentPayouts,
  };
}

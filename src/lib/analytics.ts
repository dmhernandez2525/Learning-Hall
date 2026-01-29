import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@/payload.config';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RevenueStats {
  totalRevenue: number;
  netRevenue: number;
  totalRefunds: number;
  transactionCount: number;
  averageOrderValue: number;
  refundRate: number;
}

interface RevenueByPeriod {
  period: string;
  revenue: number;
  transactions: number;
}

/**
 * Get overall revenue statistics
 */
export async function getRevenueOverview(options?: {
  dateRange?: DateRange;
  tenantId?: string;
}): Promise<RevenueStats> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'succeeded' } },
  ];

  if (options?.dateRange) {
    conditions.push({
      createdAt: { greater_than_equal: options.dateRange.startDate.toISOString() },
    });
    conditions.push({
      createdAt: { less_than_equal: options.dateRange.endDate.toISOString() },
    });
  }

  if (options?.tenantId) {
    conditions.push({ tenant: { equals: options.tenantId } });
  }

  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: { and: conditions },
    limit: 10000,
  });

  // Get refunds
  const refundConditions: Where[] = [
    { status: { in: ['refunded', 'partially_refunded'] } },
  ];

  if (options?.dateRange) {
    refundConditions.push({
      createdAt: { greater_than_equal: options.dateRange.startDate.toISOString() },
    });
  }

  const { docs: refunds } = await payload.find({
    collection: 'payments',
    where: { and: refundConditions },
    limit: 10000,
  });

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const netRevenue = payments.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const totalRefunds = refunds.reduce((sum, r) => sum + (r.refund?.amount || 0), 0);
  const transactionCount = payments.length;

  return {
    totalRevenue,
    netRevenue,
    totalRefunds,
    transactionCount,
    averageOrderValue: transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0,
    refundRate: transactionCount > 0 ? Math.round((refunds.length / transactionCount) * 100) : 0,
  };
}

/**
 * Get revenue by time period (daily, weekly, monthly)
 */
export async function getRevenueByPeriod(options: {
  period: 'day' | 'week' | 'month';
  dateRange: DateRange;
  tenantId?: string;
}): Promise<RevenueByPeriod[]> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'succeeded' } },
    { createdAt: { greater_than_equal: options.dateRange.startDate.toISOString() } },
    { createdAt: { less_than_equal: options.dateRange.endDate.toISOString() } },
  ];

  if (options.tenantId) {
    conditions.push({ tenant: { equals: options.tenantId } });
  }

  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: { and: conditions },
    sort: 'createdAt',
    limit: 10000,
  });

  // Group by period
  const grouped = new Map<string, { revenue: number; transactions: number }>();

  for (const payment of payments) {
    const date = new Date(payment.createdAt);
    let periodKey: string;

    switch (options.period) {
      case 'day':
        periodKey = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    const current = grouped.get(periodKey) || { revenue: 0, transactions: 0 };
    grouped.set(periodKey, {
      revenue: current.revenue + (payment.amount || 0),
      transactions: current.transactions + 1,
    });
  }

  return Array.from(grouped.entries())
    .map(([period, data]) => ({
      period,
      revenue: data.revenue,
      transactions: data.transactions,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Get revenue by product type
 */
export async function getRevenueByProductType(options?: {
  dateRange?: DateRange;
  tenantId?: string;
}): Promise<Record<string, { revenue: number; count: number }>> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'succeeded' } },
  ];

  if (options?.dateRange) {
    conditions.push({
      createdAt: { greater_than_equal: options.dateRange.startDate.toISOString() },
    });
    conditions.push({
      createdAt: { less_than_equal: options.dateRange.endDate.toISOString() },
    });
  }

  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: { and: conditions },
    limit: 10000,
  });

  const byType: Record<string, { revenue: number; count: number }> = {};

  for (const payment of payments) {
    const type = payment.type || 'other';
    if (!byType[type]) {
      byType[type] = { revenue: 0, count: 0 };
    }
    byType[type].revenue += payment.amount || 0;
    byType[type].count += 1;
  }

  return byType;
}

/**
 * Get top courses by revenue
 */
export async function getTopCoursesByRevenue(options?: {
  limit?: number;
  dateRange?: DateRange;
  tenantId?: string;
}): Promise<Array<{ courseId: string; title: string; revenue: number; sales: number }>> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'succeeded' } },
    { type: { equals: 'course_purchase' } },
  ];

  if (options?.dateRange) {
    conditions.push({
      createdAt: { greater_than_equal: options.dateRange.startDate.toISOString() },
    });
  }

  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: { and: conditions },
    limit: 10000,
  });

  // Group by course
  const byCourse = new Map<string, { revenue: number; sales: number }>();

  for (const payment of payments) {
    const courseItem = payment.items?.find((item: { type: string }) => item.type === 'course');
    if (!courseItem?.course) continue;

    const courseId = typeof courseItem.course === 'string' ? courseItem.course : courseItem.course.id;
    const current = byCourse.get(courseId) || { revenue: 0, sales: 0 };
    byCourse.set(courseId, {
      revenue: current.revenue + (payment.amount || 0),
      sales: current.sales + 1,
    });
  }

  // Get course details
  const results = [];
  for (const [courseId, data] of byCourse) {
    try {
      const course = await payload.findByID({
        collection: 'courses',
        id: courseId,
      });
      results.push({
        courseId,
        title: course?.title || 'Unknown Course',
        revenue: data.revenue,
        sales: data.sales,
      });
    } catch {
      // Course may have been deleted
    }
  }

  return results
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, options?.limit || 10);
}

/**
 * Get subscription metrics
 */
export async function getSubscriptionMetrics(tenantId?: string) {
  const payload = await getPayload({ config });

  const activeConditions: Where[] = [
    { status: { in: ['active', 'trialing'] } },
  ];

  if (tenantId) {
    activeConditions.push({ tenant: { equals: tenantId } });
  }

  const { docs: activeSubscriptions } = await payload.find({
    collection: 'subscriptions',
    where: { and: activeConditions },
    limit: 10000,
  });

  // Calculate MRR
  let mrr = 0;
  const planCounts: Record<string, number> = {};

  for (const sub of activeSubscriptions) {
    const plan = typeof sub.plan === 'object' ? sub.plan : null;
    if (!plan) continue;

    const planId = plan.id;
    planCounts[planId] = (planCounts[planId] || 0) + 1;

    // Calculate monthly equivalent
    const amount = plan.pricing?.amount || 0;
    const interval = plan.pricing?.interval;
    const intervalCount = plan.pricing?.intervalCount || 1;

    if (interval === 'month') {
      mrr += amount / intervalCount;
    } else if (interval === 'year') {
      mrr += amount / (12 * intervalCount);
    }
  }

  // Get churn data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { docs: canceledSubs } = await payload.find({
    collection: 'subscriptions',
    where: {
      and: [
        { status: { equals: 'canceled' } },
        { canceledAt: { greater_than_equal: thirtyDaysAgo.toISOString() } },
      ],
    },
    limit: 10000,
  });

  const totalAtStartOfPeriod = activeSubscriptions.length + canceledSubs.length;
  const churnRate = totalAtStartOfPeriod > 0
    ? Math.round((canceledSubs.length / totalAtStartOfPeriod) * 100)
    : 0;

  return {
    activeSubscriptions: activeSubscriptions.length,
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    churnRate,
    canceledLast30Days: canceledSubs.length,
    planDistribution: planCounts,
  };
}

/**
 * Get instructor earnings for a period
 */
export async function getInstructorEarnings(
  instructorId: string,
  options?: {
    dateRange?: DateRange;
  }
) {
  const payload = await getPayload({ config });

  // Get instructor's courses
  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: { instructor: { equals: instructorId } },
    limit: 1000,
  });

  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return {
      totalEarnings: 0,
      pendingPayout: 0,
      courses: [],
    };
  }

  // Get payments for these courses
  const paymentConditions: Where[] = [
    { status: { equals: 'succeeded' } },
  ];

  if (options?.dateRange) {
    paymentConditions.push({
      createdAt: { greater_than_equal: options.dateRange.startDate.toISOString() },
    });
    paymentConditions.push({
      createdAt: { less_than_equal: options.dateRange.endDate.toISOString() },
    });
  }

  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: { and: paymentConditions },
    limit: 10000,
  });

  // Calculate earnings per course
  const courseEarnings = new Map<string, { revenue: number; sales: number }>();

  for (const payment of payments) {
    for (const item of payment.items || []) {
      if (item.type !== 'course') continue;
      const courseId = typeof item.course === 'string' ? item.course : item.course?.id;
      if (!courseId || !courseIds.includes(courseId)) continue;

      const current = courseEarnings.get(courseId) || { revenue: 0, sales: 0 };
      courseEarnings.set(courseId, {
        revenue: current.revenue + (item.price || 0),
        sales: current.sales + 1,
      });
    }
  }

  // Apply revenue share (default 70% to instructor)
  const INSTRUCTOR_SHARE = 0.7;
  let totalEarnings = 0;

  const courseResults = courses.map((course) => {
    const earnings = courseEarnings.get(course.id) || { revenue: 0, sales: 0 };
    const instructorEarnings = Math.round(earnings.revenue * INSTRUCTOR_SHARE);
    totalEarnings += instructorEarnings;

    return {
      courseId: course.id,
      title: course.title,
      revenue: earnings.revenue,
      sales: earnings.sales,
      instructorEarnings,
    };
  });

  // Get pending payouts
  const { docs: pendingPayouts } = await payload.find({
    collection: 'instructor-payouts',
    where: {
      and: [
        { instructor: { equals: instructorId } },
        { status: { equals: 'pending' } },
      ],
    },
    limit: 100,
  });

  const pendingPayout = pendingPayouts.reduce(
    (sum, p) => sum + (p.earnings?.net || 0),
    0
  );

  return {
    totalEarnings,
    pendingPayout,
    courses: courseResults.filter((c) => c.sales > 0),
  };
}

/**
 * Generate instructor payout
 */
export async function generateInstructorPayout(
  instructorId: string,
  month: number,
  year: number,
  processedBy: string
) {
  const payload = await getPayload({ config });

  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const earnings = await getInstructorEarnings(instructorId, {
    dateRange: { startDate, endDate },
  });

  if (earnings.totalEarnings === 0) {
    throw new Error('No earnings for this period');
  }

  // Calculate fees
  const platformFee = Math.round(earnings.totalEarnings * 0.3); // 30% platform
  const processingFee = Math.round(earnings.totalEarnings * 0.029 + 30); // ~3% processing
  const netPayout = earnings.totalEarnings - platformFee - processingFee;

  const grossRevenue = earnings.courses.reduce((sum, c) => sum + c.revenue, 0);

  return payload.create({
    collection: 'instructor-payouts',
    data: {
      instructor: instructorId,
      status: 'pending',
      period: {
        month,
        year,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      earnings: {
        gross: grossRevenue,
        platformFee,
        processingFee,
        refunds: 0,
        adjustments: 0,
        net: netPayout,
      },
      courses: earnings.courses.map((c) => ({
        course: c.courseId,
        sales: c.sales,
        revenue: c.revenue,
        refunds: 0,
        revenueShare: 70,
        earnings: c.instructorEarnings,
      })),
      processedBy,
    },
  });
}

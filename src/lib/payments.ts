import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentInput {
  userId: string;
  type: 'course_purchase' | 'bundle_purchase' | 'subscription' | 'subscription_renewal';
  amount: number;
  currency?: string;
  items: Array<{
    type: 'course' | 'bundle' | 'subscription';
    courseId?: string;
    bundleId?: string;
    subscriptionPlanId?: string;
    price: number;
    quantity?: number;
  }>;
  stripeData?: {
    paymentIntentId?: string;
    chargeId?: string;
    sessionId?: string;
    subscriptionId?: string;
    invoiceId?: string;
    customerId?: string;
    receiptUrl?: string;
  };
  coupon?: {
    code: string;
    discountAmount?: number;
    discountPercent?: number;
  };
  affiliate?: {
    affiliateId: string;
    commission: number;
    commissionRate: number;
  };
  tenantId?: string;
}

/**
 * Create a payment record
 */
export async function createPayment(input: CreatePaymentInput) {
  const payload = await getPayload({ config });

  // Calculate fees (approximately 2.9% + 30¢ for Stripe)
  const stripeFee = Math.round(input.amount * 0.029 + 30);
  const platformFee = Math.round(input.amount * 0.05); // 5% platform fee
  const totalFees = stripeFee + platformFee;
  const netAmount = input.amount - totalFees;

  const payment = await payload.create({
    collection: 'payments',
    data: {
      user: input.userId,
      type: input.type,
      status: 'succeeded',
      amount: input.amount,
      currency: input.currency || 'usd',
      netAmount,
      fees: {
        stripe: stripeFee,
        platform: platformFee,
        total: totalFees,
      },
      stripe: input.stripeData
        ? {
            paymentIntentId: input.stripeData.paymentIntentId,
            chargeId: input.stripeData.chargeId,
            sessionId: input.stripeData.sessionId,
            subscriptionId: input.stripeData.subscriptionId,
            invoiceId: input.stripeData.invoiceId,
            customerId: input.stripeData.customerId,
            receiptUrl: input.stripeData.receiptUrl,
          }
        : undefined,
      items: input.items.map((item) => ({
        type: item.type,
        course: item.courseId,
        bundleId: item.bundleId,
        subscriptionPlanId: item.subscriptionPlanId,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      coupon: input.coupon,
      affiliate: input.affiliate,
      tenant: input.tenantId,
    },
  });

  return payment;
}

/**
 * Get payment by Stripe payment intent ID
 */
export async function getPaymentByPaymentIntent(paymentIntentId: string) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'payments',
    where: {
      'stripe.paymentIntentId': { equals: paymentIntentId },
    },
    limit: 1,
  });

  return docs[0] || null;
}

/**
 * Get payment by Stripe charge ID
 */
export async function getPaymentByChargeId(chargeId: string) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'payments',
    where: {
      'stripe.chargeId': { equals: chargeId },
    },
    limit: 1,
  });

  return docs[0] || null;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  additionalData?: Record<string, unknown>
) {
  const payload = await getPayload({ config });

  return payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status,
      ...additionalData,
    },
  });
}

/**
 * Process refund
 */
export async function processRefund(
  paymentId: string,
  amount: number,
  reason: string,
  notes?: string
) {
  const payload = await getPayload({ config });

  const payment = await payload.findByID({
    collection: 'payments',
    id: paymentId,
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Process refund with Stripe if we have the charge ID
  let stripeRefundId: string | undefined;
  if (payment.stripe?.chargeId) {
    const refund = await stripe.refunds.create({
      charge: payment.stripe.chargeId,
      amount,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
    stripeRefundId = refund.id;
  }

  const isPartial = amount < payment.amount;

  return payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status: isPartial ? 'partially_refunded' : 'refunded',
      stripe: {
        ...payment.stripe,
        refundId: stripeRefundId,
      },
      refund: {
        amount,
        reason,
        notes,
        processedAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Handle dispute
 */
export async function handleDispute(
  paymentId: string,
  disputeData: {
    reason: string;
    status: string;
    amount: number;
    stripeDisputeId: string;
    dueBy?: string;
  }
) {
  const payload = await getPayload({ config });

  const payment = await payload.findByID({
    collection: 'payments',
    id: paymentId,
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status: 'disputed',
      stripe: {
        ...payment.stripe,
        disputeId: disputeData.stripeDisputeId,
      },
      dispute: {
        reason: disputeData.reason,
        status: disputeData.status,
        amount: disputeData.amount,
        dueBy: disputeData.dueBy,
      },
    },
  });
}

/**
 * Get user's payment history
 */
export async function getUserPayments(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }
) {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { user: { equals: userId } },
  ];

  if (options?.type) {
    conditions.push({ type: { equals: options.type } });
  }

  if (options?.status) {
    conditions.push({ status: { equals: options.status } });
  }

  return payload.find({
    collection: 'payments',
    where: { and: conditions },
    page: options?.page || 1,
    limit: options?.limit || 10,
    sort: '-createdAt',
  });
}

/**
 * Get revenue statistics
 */
export async function getRevenueStats(options?: {
  startDate?: Date;
  endDate?: Date;
  tenantId?: string;
}) {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'succeeded' } },
  ];

  if (options?.startDate) {
    conditions.push({ createdAt: { greater_than_equal: options.startDate.toISOString() } });
  }

  if (options?.endDate) {
    conditions.push({ createdAt: { less_than_equal: options.endDate.toISOString() } });
  }

  if (options?.tenantId) {
    conditions.push({ tenant: { equals: options.tenantId } });
  }

  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: { and: conditions },
    limit: 10000,
  });

  const stats = {
    totalRevenue: 0,
    netRevenue: 0,
    totalFees: 0,
    totalRefunds: 0,
    transactionCount: payments.length,
    byType: {} as Record<string, { count: number; revenue: number }>,
  };

  for (const payment of payments) {
    stats.totalRevenue += payment.amount || 0;
    stats.netRevenue += payment.netAmount || 0;
    stats.totalFees += payment.fees?.total || 0;

    const type = payment.type || 'unknown';
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, revenue: 0 };
    }
    stats.byType[type].count++;
    stats.byType[type].revenue += payment.amount || 0;
  }

  // Get refunds
  const { docs: refunds } = await payload.find({
    collection: 'payments',
    where: {
      status: { in: ['refunded', 'partially_refunded'] },
      ...(options?.startDate && {
        createdAt: { greater_than_equal: options.startDate.toISOString() },
      }),
    },
    limit: 10000,
  });

  for (const refund of refunds) {
    stats.totalRefunds += refund.refund?.amount || 0;
  }

  return stats;
}

/**
 * Create Stripe checkout session for course purchase
 */
export async function createCheckoutSession(options: {
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  price: number;
  successUrl: string;
  cancelUrl: string;
  couponCode?: string;
  affiliateCode?: string;
}) {
  // Get or create Stripe customer
  let customer: Stripe.Customer;
  const existingCustomers = await stripe.customers.list({
    email: options.userEmail,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: options.userEmail,
      metadata: {
        userId: options.userId,
      },
    });
  }

  // Create checkout session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customer.id,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: options.courseTitle,
            metadata: {
              courseId: options.courseId,
            },
          },
          unit_amount: options.price,
        },
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: {
      userId: options.userId,
      courseId: options.courseId,
      type: 'course_purchase',
      affiliateCode: options.affiliateCode || '',
    },
  };

  // Apply coupon if provided
  if (options.couponCode) {
    sessionParams.discounts = [{ coupon: options.couponCode }];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
}

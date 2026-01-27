import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: {
      and: [
        { user: { equals: userId } },
        { status: { in: ['active', 'trialing'] } },
      ],
    },
    limit: 1,
    depth: 2,
  });

  return docs[0] || null;
}

/**
 * Check if user has access to a course through subscription
 */
export async function hasSubscriptionAccess(userId: string, courseId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) return false;

  const plan = typeof subscription.plan === 'object' ? subscription.plan : null;
  if (!plan) return false;

  const accessType = plan.access?.type;

  switch (accessType) {
    case 'all_courses':
      return true;

    case 'specific_courses':
      if (!plan.access?.courses) return false;
      return plan.access.courses.some((c: { id?: string } | string) =>
        (typeof c === 'object' ? c.id : c) === courseId
      );

    case 'categories':
    case 'tiers':
      // Would need to check course category/tier
      // For now, return false - implement based on course schema
      return false;

    default:
      return false;
  }
}

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionCheckout(options: {
  userId: string;
  userEmail: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const payload = await getPayload({ config });

  // Get the subscription plan
  const plan = await payload.findByID({
    collection: 'subscription-plans',
    id: options.planId,
  });

  if (!plan || !plan.stripe?.priceId) {
    throw new Error('Invalid subscription plan');
  }

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

    // Update user with Stripe customer ID
    await payload.update({
      collection: 'users',
      id: options.userId,
      data: {
        stripeCustomerId: customer.id,
      },
    });
  }

  // Create checkout session
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripe.priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: {
      userId: options.userId,
      planId: options.planId,
      type: 'subscription',
    },
    subscription_data: {
      metadata: {
        userId: options.userId,
        planId: options.planId,
      },
    },
  };

  // Add trial if plan has trial days
  if (plan.pricing?.trialDays && plan.pricing.trialDays > 0) {
    sessionParams.subscription_data!.trial_period_days = plan.pricing.trialDays;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  userId: string,
  reason?: string,
  feedback?: string,
  immediately?: boolean
) {
  const payload = await getPayload({ config });
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  // Cancel on Stripe
  if (immediately) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  } else {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // Update in database
  return payload.update({
    collection: 'subscriptions',
    id: subscription.id,
    data: {
      status: immediately ? 'canceled' : subscription.status,
      cancelAtPeriodEnd: !immediately,
      canceledAt: immediately ? new Date().toISOString() : undefined,
      cancelReason: reason,
      cancelFeedback: feedback,
    },
  });
}

/**
 * Reactivate a subscription scheduled for cancellation
 */
export async function reactivateSubscription(userId: string) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: {
      and: [
        { user: { equals: userId } },
        { cancelAtPeriodEnd: { equals: true } },
      ],
    },
    limit: 1,
  });

  if (docs.length === 0) {
    throw new Error('No subscription pending cancellation');
  }

  const subscription = docs[0];

  // Reactivate on Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // Update in database
  return payload.update({
    collection: 'subscriptions',
    id: subscription.id,
    data: {
      cancelAtPeriodEnd: false,
      canceledAt: null,
      cancelReason: null,
      cancelFeedback: null,
    },
  });
}

/**
 * Update subscription usage
 */
export async function incrementSubscriptionUsage(
  userId: string,
  field: 'coursesEnrolled' | 'downloadsUsed' | 'aiQuestionsUsed',
  amount: number = 1
) {
  const payload = await getPayload({ config });
  const subscription = await getUserSubscription(userId);

  if (!subscription) return null;

  const currentValue = subscription.usage?.[field] || 0;

  return payload.update({
    collection: 'subscriptions',
    id: subscription.id,
    data: {
      usage: {
        ...subscription.usage,
        [field]: currentValue + amount,
      },
    },
  });
}

/**
 * Check if user is within usage limits
 */
export async function checkUsageLimit(
  userId: string,
  field: 'coursesEnrolled' | 'downloadsUsed' | 'aiQuestionsUsed'
): Promise<{ allowed: boolean; current: number; limit: number | null }> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const plan = typeof subscription.plan === 'object' ? subscription.plan : null;
  if (!plan) {
    return { allowed: false, current: 0, limit: 0 };
  }

  const limitMap = {
    coursesEnrolled: plan.limits?.maxCourses,
    downloadsUsed: plan.limits?.maxDownloads,
    aiQuestionsUsed: plan.limits?.maxAIQuestions,
  };

  const limit = limitMap[field];
  const current = subscription.usage?.[field] || 0;

  // null limit means unlimited
  if (limit === null || limit === undefined) {
    return { allowed: true, current, limit: null };
  }

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(tenantId?: string) {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { isActive: { equals: true } },
  ];

  if (tenantId) {
    conditions.push({
      or: [
        { tenant: { equals: tenantId } },
        { tenant: { exists: false } },
      ],
    });
  } else {
    conditions.push({ tenant: { exists: false } });
  }

  const { docs } = await payload.find({
    collection: 'subscription-plans',
    where: { and: conditions },
    sort: 'displayOrder',
    limit: 100,
  });

  return docs;
}

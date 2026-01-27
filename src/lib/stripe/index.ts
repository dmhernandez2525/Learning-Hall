import Stripe from 'stripe';
import { getPayloadClient } from '@/lib/payload';
import type {
  CreateCheckoutSessionParams,
  CheckoutSessionResult,
  PaymentStatus,
  EnrollmentResult,
  RefundParams,
  RefundResult,
  CustomerPortalParams,
  CustomerPortalResult,
} from './types';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: params.mode || 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.courseTitle,
            metadata: {
              courseId: params.courseId,
            },
          },
          unit_amount: params.priceInCents,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      userId: params.userId,
      courseId: params.courseId,
      ...params.metadata,
    },
    client_reference_id: params.userId,
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'customer'],
  });
}

export async function handleCheckoutComplete(
  session: Stripe.Checkout.Session
): Promise<EnrollmentResult> {
  const payload = await getPayloadClient();
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;

  if (!userId || !courseId) {
    return {
      success: false,
      error: 'Missing userId or courseId in session metadata',
    };
  }

  try {
    // Create payment record
    const payment = await payload.create({
      collection: 'payments',
      data: {
        user: userId,
        course: courseId,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        stripeCustomerId:
          typeof session.customer === 'string' ? session.customer : session.customer?.id,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'succeeded',
      },
    });

    // Create enrollment
    const existingEnrollment = await payload.find({
      collection: 'enrollments',
      where: {
        and: [{ user: { equals: userId } }, { course: { equals: courseId } }],
      },
      limit: 1,
    });

    if (existingEnrollment.docs.length > 0) {
      // Update existing enrollment
      await payload.update({
        collection: 'enrollments',
        id: existingEnrollment.docs[0].id,
        data: {
          status: 'active',
          paymentId: payment.id,
        },
      });
      return {
        success: true,
        enrollmentId: String(existingEnrollment.docs[0].id),
      };
    }

    // Create new enrollment
    const enrollment = await payload.create({
      collection: 'enrollments',
      data: {
        user: userId,
        course: courseId,
        status: 'active',
        paymentId: payment.id,
        enrolledAt: new Date().toISOString(),
        progress: 0,
      },
    });

    return {
      success: true,
      enrollmentId: String(enrollment.id),
    };
  } catch (error) {
    console.error('Error handling checkout complete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process enrollment',
    };
  }
}

export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const payload = await getPayloadClient();

  // Find payment by payment intent ID
  const payments = await payload.find({
    collection: 'payments',
    where: {
      stripePaymentIntentId: { equals: paymentIntent.id },
    },
    limit: 1,
  });

  if (payments.docs.length > 0) {
    await payload.update({
      collection: 'payments',
      id: payments.docs[0].id,
      data: {
        status: 'failed',
      },
    });
  }
}

export async function processRefund(params: RefundParams): Promise<RefundResult> {
  const payload = await getPayloadClient();
  const stripe = getStripeClient();

  try {
    // Get payment record
    const payment = await payload.findByID({
      collection: 'payments',
      id: params.paymentId,
    });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (!payment.stripePaymentIntentId) {
      return { success: false, error: 'No payment intent found for this payment' };
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: params.amount,
      reason: (params.reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
    });

    // Update payment status
    const newStatus: PaymentStatus = params.amount ? 'refunded' : 'refunded';
    await payload.update({
      collection: 'payments',
      id: params.paymentId,
      data: {
        status: newStatus,
      },
    });

    // If full refund, deactivate enrollment
    if (!params.amount) {
      const enrollments = await payload.find({
        collection: 'enrollments',
        where: {
          paymentId: { equals: params.paymentId },
        },
        limit: 1,
      });

      if (enrollments.docs.length > 0) {
        await payload.update({
          collection: 'enrollments',
          id: enrollments.docs[0].id,
          data: {
            status: 'canceled',
          },
        });
      }
    }

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    };
  }
}

export async function createCustomerPortalSession(
  params: CustomerPortalParams
): Promise<CustomerPortalResult> {
  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return {
    url: session.url,
  };
}

export async function getOrCreateCustomer(email: string, userId: string): Promise<string> {
  const payload = await getPayloadClient();
  const stripe = getStripeClient();

  // Check if user already has a Stripe customer ID
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;

    // Update user with Stripe customer ID
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        stripeCustomerId: customerId,
      },
    });

    return customerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  // Update user with Stripe customer ID
  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

export async function getPaymentHistory(userId: string): Promise<
  {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    courseTitle?: string;
    createdAt: string;
  }[]
> {
  const payload = await getPayloadClient();

  const payments = await payload.find({
    collection: 'payments',
    where: {
      user: { equals: userId },
    },
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  });

  return payments.docs.map((payment) => ({
    id: String(payment.id),
    amount: payment.amount as number,
    currency: payment.currency as string,
    status: payment.status as PaymentStatus,
    courseTitle: typeof payment.course === 'object' ? payment.course?.title : undefined,
    createdAt: payment.createdAt as string,
  }));
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { type Stripe };

import { NextRequest, NextResponse } from 'next/server';
import {
  constructWebhookEvent,
  handleCheckoutComplete,
  handlePaymentFailed,
  type Stripe,
} from '@/lib/stripe';
import { getPayloadClient } from '@/lib/payload';
import {
  createPayment,
  getPaymentByChargeId,
  updatePaymentStatus,
  handleDispute as processDispute,
} from '@/lib/payments';

/**
 * Check if a payment has already been processed (idempotency)
 */
async function isPaymentProcessed(sessionId: string): Promise<boolean> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'payments',
    where: { stripeSessionId: { equals: sessionId } },
    limit: 1,
  });
  return existing.docs.length > 0;
}

export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Stripe webhook: Missing signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Log event for debugging
  console.log(`Stripe webhook received: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Idempotency check - don't process the same payment twice
        if (await isPaymentProcessed(session.id)) {
          console.log(`Payment already processed for session: ${session.id}`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        if (session.payment_status === 'paid') {
          const result = await handleCheckoutComplete(session);

          if (!result.success) {
            console.error('Failed to process checkout:', result.error);
            // Still return 200 to acknowledge receipt - we've logged the error
            // Returning 500 would cause Stripe to retry, potentially causing issues
          }
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (await isPaymentProcessed(session.id)) {
          console.log(`Payment already processed for session: ${session.id}`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        const result = await handleCheckoutComplete(session);

        if (!result.success) {
          console.error('Failed to process async payment:', result.error);
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Async payment failed for session:', session.id);
        // Could notify user here
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          console.log('Subscription invoice paid:', invoice.id);
          await handleSubscriptionRenewal(invoice);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', invoice.id);
        // Could notify user and/or update subscription status
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);
        await handleChargeRefunded(charge);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Dispute created:', dispute.id);
        await handleDisputeCreated(dispute);
        break;
      }

      case 'charge.dispute.updated': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Dispute updated:', dispute.id);
        await handleDisputeUpdated(dispute);
        break;
      }

      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Dispute closed:', dispute.id);
        await handleDisputeClosed(dispute);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Log the error but return 200 to prevent Stripe retries
    // Retries on transient errors could cause duplicate processing
    console.error('Webhook handler error:', error);
    return NextResponse.json({ received: true, error: 'Handler error logged' });
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const payload = await getPayloadClient();
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const { docs: users } = await payload.find({
    collection: 'users',
    where: { stripeCustomerId: { equals: customerId } },
    limit: 1,
  });

  if (users.length === 0) {
    console.error('User not found for Stripe customer:', customerId);
    return;
  }

  const user = users[0];
  const priceId = subscription.items.data[0]?.price.id;

  // Find subscription plan by price ID
  const { docs: plans } = await payload.find({
    collection: 'subscription-plans',
    where: { stripePriceId: { equals: priceId } },
    limit: 1,
  });

  if (plans.length === 0) {
    console.error('Subscription plan not found for price:', priceId);
    return;
  }

  // Create or update user subscription
  const existingSubscription = await payload.find({
    collection: 'subscriptions',
    where: { user: { equals: user.id } },
    limit: 1,
  });

  if (existingSubscription.docs.length > 0) {
    await payload.update({
      collection: 'subscriptions',
      id: existingSubscription.docs[0].id,
      data: {
        plan: plans[0].id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      },
    });
  } else {
    await payload.create({
      collection: 'subscriptions',
      data: {
        user: user.id,
        plan: plans[0].id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      },
    });
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeSubscriptionId: { equals: subscription.id } },
    limit: 1,
  });

  if (docs.length === 0) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  await payload.update({
    collection: 'subscriptions',
    id: docs[0].id,
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeSubscriptionId: { equals: subscription.id } },
    limit: 1,
  });

  if (docs.length === 0) {
    console.error('Subscription not found:', subscription.id);
    return;
  }

  await payload.update({
    collection: 'subscriptions',
    id: docs[0].id,
    data: {
      status: 'canceled',
      canceledAt: new Date().toISOString(),
    },
  });
}

/**
 * Handle subscription renewal (invoice paid)
 */
async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  const payload = await getPayloadClient();
  const subscriptionId = invoice.subscription as string;

  const { docs } = await payload.find({
    collection: 'subscriptions',
    where: { stripeSubscriptionId: { equals: subscriptionId } },
    limit: 1,
  });

  if (docs.length === 0) {
    console.error('Subscription not found for renewal:', subscriptionId);
    return;
  }

  const subscription = docs[0];
  const userId = typeof subscription.user === 'string' ? subscription.user : subscription.user?.id;

  if (!userId) return;

  // Create payment record for renewal
  await createPayment({
    userId,
    type: 'subscription_renewal',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    items: [
      {
        type: 'subscription',
        subscriptionPlanId: typeof subscription.plan === 'string' ? subscription.plan : subscription.plan?.id,
        price: invoice.amount_paid,
      },
    ],
    stripeData: {
      invoiceId: invoice.id,
      subscriptionId,
      chargeId: invoice.charge as string,
      receiptUrl: invoice.hosted_invoice_url || undefined,
    },
  });
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await getPaymentByChargeId(charge.id);

  if (!payment) {
    console.error('Payment not found for charge:', charge.id);
    return;
  }

  const refundAmount = charge.amount_refunded;
  const isPartialRefund = refundAmount < charge.amount;

  await updatePaymentStatus(String(payment.id), isPartialRefund ? 'partially_refunded' : 'refunded', {
    refund: {
      amount: refundAmount,
      reason: 'requested_by_customer',
      processedAt: new Date().toISOString(),
    },
  });
}

/**
 * Handle dispute created
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const chargeId = dispute.charge as string;
  const payment = await getPaymentByChargeId(chargeId);

  if (!payment) {
    console.error('Payment not found for disputed charge:', chargeId);
    return;
  }

  await processDispute(String(payment.id), {
    reason: dispute.reason,
    status: dispute.status,
    amount: dispute.amount,
    stripeDisputeId: dispute.id,
    dueBy: dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
      : undefined,
  });
}

/**
 * Handle dispute updated
 */
async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: 'payments',
    where: { 'stripe.disputeId': { equals: dispute.id } },
    limit: 1,
  });

  if (docs.length === 0) {
    console.error('Payment not found for dispute:', dispute.id);
    return;
  }

  await payload.update({
    collection: 'payments',
    id: docs[0].id,
    data: {
      dispute: {
        ...docs[0].dispute,
        status: dispute.status,
      },
    },
  });
}

/**
 * Handle dispute closed
 */
async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const payload = await getPayloadClient();

  const { docs } = await payload.find({
    collection: 'payments',
    where: { 'stripe.disputeId': { equals: dispute.id } },
    limit: 1,
  });

  if (docs.length === 0) {
    console.error('Payment not found for dispute:', dispute.id);
    return;
  }

  const isWon = dispute.status === 'won';

  await payload.update({
    collection: 'payments',
    id: docs[0].id,
    data: {
      status: isWon ? 'succeeded' : 'refunded',
      dispute: {
        ...docs[0].dispute,
        status: dispute.status,
        resolvedAt: new Date().toISOString(),
      },
    },
  });
}

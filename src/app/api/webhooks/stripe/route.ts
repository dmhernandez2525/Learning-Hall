import { NextRequest, NextResponse } from 'next/server';
import {
  constructWebhookEvent,
  handleCheckoutComplete,
  handlePaymentFailed,
  type Stripe,
} from '@/lib/stripe';
import { getPayloadClient } from '@/lib/payload';

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

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription event:', event.type, subscription.id);
        // TODO: Handle subscription lifecycle events
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

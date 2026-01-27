import Stripe from 'stripe';

export type StripeCheckoutMode = 'payment' | 'subscription';

export interface CreateCheckoutSessionParams {
  userId: string;
  courseId: string;
  priceInCents: number;
  courseTitle: string;
  successUrl: string;
  cancelUrl: string;
  mode?: StripeCheckoutMode;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: Stripe.Checkout.Session | Stripe.PaymentIntent | Stripe.Subscription;
  };
}

export interface PaymentRecord {
  id: string;
  userId: string;
  courseId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'canceled';

export interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  error?: string;
}

export interface RefundParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface CustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

export interface CustomerPortalResult {
  url: string;
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

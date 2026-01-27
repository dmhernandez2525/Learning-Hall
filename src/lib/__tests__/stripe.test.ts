import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  customers: {
    list: vi.fn(),
    create: vi.fn(),
  },
  refunds: {
    create: vi.fn(),
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => {
  return {
    default: vi.fn(() => mockStripe),
  };
});

// Mock Payload client
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

vi.mock('@/lib/payload', () => ({
  getPayloadClient: () => Promise.resolve(mockPayload),
}));

// Set environment variables
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake_key');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_fake_secret');

import {
  createCheckoutSession,
  getCheckoutSession,
  handleCheckoutComplete,
  handlePaymentFailed,
  processRefund,
  createCustomerPortalSession,
  getOrCreateCustomer,
  getPaymentHistory,
} from '../stripe';

describe('Stripe Payment Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('creates a checkout session and returns URL', async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const result = await createCheckoutSession({
        userId: 'user-1',
        courseId: 'course-1',
        priceInCents: 4999,
        courseTitle: 'Test Course',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        customerEmail: 'test@example.com',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'usd',
                unit_amount: 4999,
                product_data: expect.objectContaining({
                  name: 'Test Course',
                }),
              }),
              quantity: 1,
            }),
          ],
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
          customer_email: 'test@example.com',
          metadata: expect.objectContaining({
            userId: 'user-1',
            courseId: 'course-1',
          }),
        })
      );

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });
    });

    it('throws error if session URL is not returned', async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: null,
      });

      await expect(
        createCheckoutSession({
          userId: 'user-1',
          courseId: 'course-1',
          priceInCents: 4999,
          courseTitle: 'Test Course',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow('Failed to create checkout session URL');
    });
  });

  describe('getCheckoutSession', () => {
    it('retrieves checkout session with expanded data', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
        metadata: { userId: 'user-1', courseId: 'course-1' },
      };
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);

      const result = await getCheckoutSession('cs_test_123');

      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith('cs_test_123', {
        expand: ['payment_intent', 'customer'],
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('handleCheckoutComplete', () => {
    const mockSession = {
      id: 'cs_test_123',
      metadata: { userId: 'user-1', courseId: 'course-1' },
      payment_intent: 'pi_test_123',
      customer: 'cus_test_123',
      amount_total: 4999,
      currency: 'usd',
    };

    it('creates payment record and enrollment for new user', async () => {
      mockPayload.create.mockResolvedValueOnce({ id: 'payment-1' });
      mockPayload.find.mockResolvedValueOnce({ docs: [] });
      mockPayload.create.mockResolvedValueOnce({ id: 'enrollment-1' });

      const result = await handleCheckoutComplete(mockSession as any);

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'payments',
        data: expect.objectContaining({
          user: 'user-1',
          course: 'course-1',
          stripeSessionId: 'cs_test_123',
          stripePaymentIntentId: 'pi_test_123',
          stripeCustomerId: 'cus_test_123',
          amount: 4999,
          currency: 'usd',
          status: 'succeeded',
        }),
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'enrollments',
        data: expect.objectContaining({
          user: 'user-1',
          course: 'course-1',
          status: 'active',
          paymentId: 'payment-1',
        }),
      });

      expect(result).toEqual({
        success: true,
        enrollmentId: 'enrollment-1',
      });
    });

    it('updates existing enrollment', async () => {
      mockPayload.create.mockResolvedValueOnce({ id: 'payment-1' });
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'enrollment-1' }],
      });
      mockPayload.update.mockResolvedValueOnce({ id: 'enrollment-1' });

      const result = await handleCheckoutComplete(mockSession as any);

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'enrollments',
        id: 'enrollment-1',
        data: expect.objectContaining({
          status: 'active',
          paymentId: 'payment-1',
        }),
      });

      expect(result).toEqual({
        success: true,
        enrollmentId: 'enrollment-1',
      });
    });

    it('returns error if metadata is missing', async () => {
      const sessionWithoutMetadata = {
        ...mockSession,
        metadata: {},
      };

      const result = await handleCheckoutComplete(sessionWithoutMetadata as any);

      expect(result).toEqual({
        success: false,
        error: 'Missing userId or courseId in session metadata',
      });
    });
  });

  describe('handlePaymentFailed', () => {
    it('updates payment status to failed', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'payment-1' }],
      });

      await handlePaymentFailed({ id: 'pi_test_123' } as any);

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'payments',
        id: 'payment-1',
        data: { status: 'failed' },
      });
    });

    it('handles case when payment is not found', async () => {
      mockPayload.find.mockResolvedValueOnce({ docs: [] });

      await handlePaymentFailed({ id: 'pi_nonexistent' } as any);

      expect(mockPayload.update).not.toHaveBeenCalled();
    });
  });

  describe('processRefund', () => {
    it('processes full refund and deactivates enrollment', async () => {
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'payment-1',
        stripePaymentIntentId: 'pi_test_123',
      });
      mockStripe.refunds.create.mockResolvedValue({ id: 're_test_123' });
      mockPayload.update.mockResolvedValueOnce({});
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'enrollment-1' }],
      });
      mockPayload.update.mockResolvedValueOnce({});

      const result = await processRefund({ paymentId: 'payment-1' });

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: undefined,
        reason: 'requested_by_customer',
      });

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'enrollments',
        id: 'enrollment-1',
        data: { status: 'canceled' },
      });

      expect(result).toEqual({
        success: true,
        refundId: 're_test_123',
      });
    });

    it('returns error if payment not found', async () => {
      mockPayload.findByID.mockResolvedValueOnce(null);

      const result = await processRefund({ paymentId: 'nonexistent' });

      expect(result).toEqual({
        success: false,
        error: 'Payment not found',
      });
    });

    it('returns error if no payment intent', async () => {
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'payment-1',
        stripePaymentIntentId: null,
      });

      const result = await processRefund({ paymentId: 'payment-1' });

      expect(result).toEqual({
        success: false,
        error: 'No payment intent found for this payment',
      });
    });
  });

  describe('createCustomerPortalSession', () => {
    it('creates billing portal session', async () => {
      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test',
      });

      const result = await createCustomerPortalSession({
        customerId: 'cus_test_123',
        returnUrl: 'https://example.com/dashboard',
      });

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'https://example.com/dashboard',
      });

      expect(result).toEqual({
        url: 'https://billing.stripe.com/session/test',
      });
    });
  });

  describe('getOrCreateCustomer', () => {
    it('returns existing customer ID from user', async () => {
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'user-1',
        stripeCustomerId: 'cus_existing_123',
      });

      const result = await getOrCreateCustomer('test@example.com', 'user-1');

      expect(result).toBe('cus_existing_123');
      expect(mockStripe.customers.list).not.toHaveBeenCalled();
    });

    it('finds existing Stripe customer by email', async () => {
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'user-1',
        stripeCustomerId: null,
      });
      mockStripe.customers.list.mockResolvedValue({
        data: [{ id: 'cus_found_123' }],
      });
      mockPayload.update.mockResolvedValueOnce({});

      const result = await getOrCreateCustomer('test@example.com', 'user-1');

      expect(result).toBe('cus_found_123');
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'users',
        id: 'user-1',
        data: { stripeCustomerId: 'cus_found_123' },
      });
    });

    it('creates new customer if none exists', async () => {
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'user-1',
        stripeCustomerId: null,
      });
      mockStripe.customers.list.mockResolvedValue({ data: [] });
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_new_123' });
      mockPayload.update.mockResolvedValueOnce({});

      const result = await getOrCreateCustomer('test@example.com', 'user-1');

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user-1' },
      });
      expect(result).toBe('cus_new_123');
    });
  });

  describe('getPaymentHistory', () => {
    it('returns formatted payment history', async () => {
      mockPayload.find.mockResolvedValueOnce({
        docs: [
          {
            id: 'payment-1',
            amount: 4999,
            currency: 'usd',
            status: 'succeeded',
            course: { title: 'Test Course' },
            createdAt: '2024-01-15T00:00:00.000Z',
          },
          {
            id: 'payment-2',
            amount: 2999,
            currency: 'usd',
            status: 'refunded',
            course: { title: 'Another Course' },
            createdAt: '2024-01-10T00:00:00.000Z',
          },
        ],
      });

      const result = await getPaymentHistory('user-1');

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'payments',
        where: { user: { equals: 'user-1' } },
        sort: '-createdAt',
        limit: 100,
        depth: 1,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'payment-1',
        amount: 4999,
        currency: 'usd',
        status: 'succeeded',
        courseTitle: 'Test Course',
        createdAt: '2024-01-15T00:00:00.000Z',
      });
    });
  });
});

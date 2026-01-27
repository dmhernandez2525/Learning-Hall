'use client';

import type { CollectionConfig } from 'payload';

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'id',
    group: 'Business',
    description: 'Payment transactions and receipts',
    defaultColumns: ['user', 'amount', 'status', 'type', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: () => false,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Course Purchase', value: 'course_purchase' },
        { label: 'Bundle Purchase', value: 'bundle_purchase' },
        { label: 'Subscription', value: 'subscription' },
        { label: 'Subscription Renewal', value: 'subscription_renewal' },
        { label: 'Refund', value: 'refund' },
        { label: 'Dispute', value: 'dispute' },
        { label: 'Payout', value: 'payout' },
      ],
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
        { label: 'Disputed', value: 'disputed' },
        { label: 'Canceled', value: 'canceled' },
      ],
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Amount in cents',
      },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'usd',
      admin: {
        description: 'Three-letter ISO currency code',
      },
    },
    {
      name: 'netAmount',
      type: 'number',
      admin: {
        description: 'Net amount after fees (in cents)',
      },
    },
    {
      name: 'fees',
      type: 'group',
      fields: [
        {
          name: 'stripe',
          type: 'number',
          admin: { description: 'Stripe processing fee (in cents)' },
        },
        {
          name: 'platform',
          type: 'number',
          admin: { description: 'Platform fee (in cents)' },
        },
        {
          name: 'total',
          type: 'number',
          admin: { description: 'Total fees (in cents)' },
        },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      admin: { description: 'Stripe-specific data' },
      fields: [
        {
          name: 'paymentIntentId',
          type: 'text',
          index: true,
        },
        {
          name: 'chargeId',
          type: 'text',
          index: true,
        },
        {
          name: 'sessionId',
          type: 'text',
          index: true,
        },
        {
          name: 'subscriptionId',
          type: 'text',
          index: true,
        },
        {
          name: 'invoiceId',
          type: 'text',
        },
        {
          name: 'customerId',
          type: 'text',
        },
        {
          name: 'paymentMethod',
          type: 'text',
        },
        {
          name: 'receiptUrl',
          type: 'text',
        },
        {
          name: 'refundId',
          type: 'text',
        },
        {
          name: 'disputeId',
          type: 'text',
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      admin: { description: 'Purchased items' },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Course', value: 'course' },
            { label: 'Bundle', value: 'bundle' },
            { label: 'Subscription', value: 'subscription' },
          ],
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'course',
          },
        },
        {
          name: 'bundleId',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'bundle',
          },
        },
        {
          name: 'subscriptionPlanId',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'subscription',
          },
        },
        {
          name: 'price',
          type: 'number',
          admin: { description: 'Item price in cents' },
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
        },
      ],
    },
    {
      name: 'coupon',
      type: 'group',
      admin: { description: 'Applied coupon/discount' },
      fields: [
        {
          name: 'code',
          type: 'text',
        },
        {
          name: 'discountAmount',
          type: 'number',
          admin: { description: 'Discount amount in cents' },
        },
        {
          name: 'discountPercent',
          type: 'number',
          admin: { description: 'Discount percentage' },
        },
      ],
    },
    {
      name: 'affiliate',
      type: 'group',
      admin: { description: 'Affiliate attribution' },
      fields: [
        {
          name: 'affiliateId',
          type: 'text',
        },
        {
          name: 'commission',
          type: 'number',
          admin: { description: 'Commission amount in cents' },
        },
        {
          name: 'commissionRate',
          type: 'number',
          admin: { description: 'Commission rate (percentage)' },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { description: 'Additional metadata' },
    },
    {
      name: 'refund',
      type: 'group',
      admin: {
        description: 'Refund details',
        condition: (data) => ['refunded', 'partially_refunded'].includes(data?.status),
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          admin: { description: 'Refund amount in cents' },
        },
        {
          name: 'reason',
          type: 'select',
          options: [
            { label: 'Duplicate', value: 'duplicate' },
            { label: 'Fraudulent', value: 'fraudulent' },
            { label: 'Requested by Customer', value: 'requested_by_customer' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
        },
        {
          name: 'processedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'dispute',
      type: 'group',
      admin: {
        description: 'Dispute details',
        condition: (data) => data?.status === 'disputed',
      },
      fields: [
        {
          name: 'reason',
          type: 'select',
          options: [
            { label: 'Bank Cannot Process', value: 'bank_cannot_process' },
            { label: 'Credit Not Processed', value: 'credit_not_processed' },
            { label: 'Customer Initiated', value: 'customer_initiated' },
            { label: 'Debit Not Authorized', value: 'debit_not_authorized' },
            { label: 'Duplicate', value: 'duplicate' },
            { label: 'Fraudulent', value: 'fraudulent' },
            { label: 'General', value: 'general' },
            { label: 'Incorrect Account Details', value: 'incorrect_account_details' },
            { label: 'Insufficient Funds', value: 'insufficient_funds' },
            { label: 'Product Not Received', value: 'product_not_received' },
            { label: 'Product Unacceptable', value: 'product_unacceptable' },
            { label: 'Subscription Canceled', value: 'subscription_canceled' },
            { label: 'Unrecognized', value: 'unrecognized' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Warning Needs Response', value: 'warning_needs_response' },
            { label: 'Warning Under Review', value: 'warning_under_review' },
            { label: 'Warning Closed', value: 'warning_closed' },
            { label: 'Needs Response', value: 'needs_response' },
            { label: 'Under Review', value: 'under_review' },
            { label: 'Charge Refunded', value: 'charge_refunded' },
            { label: 'Won', value: 'won' },
            { label: 'Lost', value: 'lost' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          admin: { description: 'Disputed amount in cents' },
        },
        {
          name: 'evidence',
          type: 'textarea',
        },
        {
          name: 'dueBy',
          type: 'date',
        },
        {
          name: 'resolvedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'billingDetails',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
  ],
  timestamps: true,
};

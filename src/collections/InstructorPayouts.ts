'use client';

import type { CollectionConfig } from 'payload';

export const InstructorPayouts: CollectionConfig = {
  slug: 'instructor-payouts',
  admin: {
    useAsTitle: 'id',
    group: 'Business',
    description: 'Instructor revenue share payouts',
    defaultColumns: ['instructor', 'amount', 'status', 'period', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { instructor: { equals: user.id } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'On Hold', value: 'on_hold' },
      ],
      index: true,
    },
    {
      name: 'period',
      type: 'group',
      fields: [
        {
          name: 'month',
          type: 'number',
          required: true,
          min: 1,
          max: 12,
        },
        {
          name: 'year',
          type: 'number',
          required: true,
        },
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
      ],
    },
    {
      name: 'earnings',
      type: 'group',
      fields: [
        {
          name: 'gross',
          type: 'number',
          required: true,
          admin: { description: 'Gross sales in cents' },
        },
        {
          name: 'platformFee',
          type: 'number',
          admin: { description: 'Platform fee in cents' },
        },
        {
          name: 'processingFee',
          type: 'number',
          admin: { description: 'Payment processing fee in cents' },
        },
        {
          name: 'refunds',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Refunds deducted in cents' },
        },
        {
          name: 'adjustments',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Manual adjustments in cents' },
        },
        {
          name: 'net',
          type: 'number',
          required: true,
          admin: { description: 'Net payout amount in cents' },
        },
      ],
    },
    {
      name: 'courses',
      type: 'array',
      admin: { description: 'Breakdown by course' },
      fields: [
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
        },
        {
          name: 'sales',
          type: 'number',
          admin: { description: 'Number of sales' },
        },
        {
          name: 'revenue',
          type: 'number',
          admin: { description: 'Revenue in cents' },
        },
        {
          name: 'refunds',
          type: 'number',
          admin: { description: 'Refunds in cents' },
        },
        {
          name: 'revenueShare',
          type: 'number',
          admin: { description: 'Instructor share percentage' },
        },
        {
          name: 'earnings',
          type: 'number',
          admin: { description: 'Instructor earnings in cents' },
        },
      ],
    },
    {
      name: 'payout',
      type: 'group',
      fields: [
        {
          name: 'method',
          type: 'select',
          options: [
            { label: 'Stripe Connect', value: 'stripe' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Bank Transfer', value: 'bank' },
          ],
        },
        {
          name: 'stripeTransferId',
          type: 'text',
        },
        {
          name: 'stripePayoutId',
          type: 'text',
        },
        {
          name: 'paypalTransactionId',
          type: 'text',
        },
        {
          name: 'bankReference',
          type: 'text',
        },
      ],
    },
    {
      name: 'processedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'failedAt',
      type: 'date',
    },
    {
      name: 'failureReason',
      type: 'textarea',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'processedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
};

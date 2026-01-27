

import type { CollectionConfig } from 'payload';

export const AffiliatePayouts: CollectionConfig = {
  slug: 'affiliate-payouts',
  admin: {
    useAsTitle: 'id',
    group: 'Affiliates',
    description: 'Affiliate payout records',
    defaultColumns: ['affiliate', 'amount', 'status', 'method', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { 'affiliate.user': { equals: user.id } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'affiliate',
      type: 'relationship',
      relationTo: 'affiliates',
      required: true,
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Payout amount in cents',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'usd',
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
        { label: 'Canceled', value: 'canceled' },
      ],
      index: true,
    },
    {
      name: 'method',
      type: 'select',
      required: true,
      options: [
        { label: 'PayPal', value: 'paypal' },
        { label: 'Bank Transfer', value: 'bank' },
        { label: 'Stripe', value: 'stripe' },
      ],
    },
    {
      name: 'period',
      type: 'group',
      admin: {
        description: 'Period this payout covers',
      },
      fields: [
        {
          name: 'start',
          type: 'date',
          required: true,
        },
        {
          name: 'end',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'breakdown',
      type: 'group',
      admin: {
        description: 'Payout breakdown',
      },
      fields: [
        {
          name: 'grossAmount',
          type: 'number',
          admin: { description: 'Gross commissions' },
        },
        {
          name: 'fees',
          type: 'number',
          admin: { description: 'Processing fees' },
        },
        {
          name: 'adjustments',
          type: 'number',
          admin: { description: 'Any adjustments' },
        },
        {
          name: 'referralCount',
          type: 'number',
          admin: { description: 'Number of referrals included' },
        },
      ],
    },
    {
      name: 'paymentDetails',
      type: 'group',
      fields: [
        {
          name: 'paypalTransactionId',
          type: 'text',
          admin: {
            condition: (data) => data?.method === 'paypal',
          },
        },
        {
          name: 'paypalEmail',
          type: 'email',
          admin: {
            condition: (data) => data?.method === 'paypal',
          },
        },
        {
          name: 'bankReference',
          type: 'text',
          admin: {
            condition: (data) => data?.method === 'bank',
          },
        },
        {
          name: 'stripeTransferId',
          type: 'text',
          admin: {
            condition: (data) => data?.method === 'stripe',
          },
        },
        {
          name: 'stripePayoutId',
          type: 'text',
          admin: {
            condition: (data) => data?.method === 'stripe',
          },
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
      admin: {
        description: 'Internal notes',
      },
    },
    {
      name: 'processedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin who processed this payout',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
};

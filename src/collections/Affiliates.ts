'use client';

import type { CollectionConfig } from 'payload';

export const Affiliates: CollectionConfig = {
  slug: 'affiliates',
  admin: {
    useAsTitle: 'code',
    group: 'Affiliates',
    description: 'Affiliate program members',
    defaultColumns: ['user', 'code', 'tier', 'status', 'balance'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique affiliate code for referrals',
      },
      hooks: {
        beforeChange: [
          ({ value }) => value?.toUpperCase(),
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Rejected', value: 'rejected' },
      ],
      index: true,
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      defaultValue: 'bronze',
      options: [
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
        { label: 'Platinum', value: 'platinum' },
      ],
    },
    {
      name: 'commissionRates',
      type: 'group',
      admin: {
        description: 'Commission rates by product type',
      },
      fields: [
        {
          name: 'courses',
          type: 'number',
          defaultValue: 20,
          min: 0,
          max: 100,
          admin: {
            description: 'Commission percentage for course sales',
          },
        },
        {
          name: 'bundles',
          type: 'number',
          defaultValue: 15,
          min: 0,
          max: 100,
          admin: {
            description: 'Commission percentage for bundle sales',
          },
        },
        {
          name: 'subscriptions',
          type: 'number',
          defaultValue: 25,
          min: 0,
          max: 100,
          admin: {
            description: 'Commission percentage for subscription sales',
          },
        },
        {
          name: 'recurringMonths',
          type: 'number',
          defaultValue: 12,
          admin: {
            description: 'Months of recurring commission for subscriptions',
          },
        },
      ],
    },
    {
      name: 'balance',
      type: 'group',
      admin: {
        description: 'Affiliate balance (in cents)',
      },
      fields: [
        {
          name: 'available',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Available for payout',
          },
        },
        {
          name: 'pending',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Pending clearance (within hold period)',
          },
        },
        {
          name: 'lifetime',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total lifetime earnings',
          },
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
            { label: 'PayPal', value: 'paypal' },
            { label: 'Bank Transfer', value: 'bank' },
            { label: 'Stripe', value: 'stripe' },
          ],
        },
        {
          name: 'paypalEmail',
          type: 'email',
          admin: {
            condition: (data, siblingData) => siblingData?.method === 'paypal',
          },
        },
        {
          name: 'bankAccount',
          type: 'group',
          admin: {
            condition: (data, siblingData) => siblingData?.method === 'bank',
          },
          fields: [
            { name: 'accountName', type: 'text' },
            { name: 'accountNumber', type: 'text' },
            { name: 'routingNumber', type: 'text' },
            { name: 'bankName', type: 'text' },
            { name: 'country', type: 'text' },
          ],
        },
        {
          name: 'stripeAccountId',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.method === 'stripe',
            description: 'Stripe Connect account ID',
          },
        },
        {
          name: 'minimumPayout',
          type: 'number',
          defaultValue: 5000,
          admin: {
            description: 'Minimum payout threshold in cents',
          },
        },
      ],
    },
    {
      name: 'attribution',
      type: 'group',
      admin: {
        description: 'Attribution settings',
      },
      fields: [
        {
          name: 'cookieDays',
          type: 'number',
          defaultValue: 30,
          admin: {
            description: 'Cookie attribution window in days',
          },
        },
        {
          name: 'lastClickOnly',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Credit last click only (vs. first click)',
          },
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'totalReferrals',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'convertedReferrals',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'conversionRate',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Percentage',
          },
        },
        {
          name: 'totalRevenue',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total revenue generated (cents)',
          },
        },
        {
          name: 'lastReferralAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'customLinks',
      type: 'array',
      admin: {
        description: 'Custom tracking links',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'destination',
          type: 'text',
          admin: {
            description: 'Destination URL (e.g., /courses/my-course)',
          },
        },
        {
          name: 'clicks',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'conversions',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'creatives',
      type: 'array',
      admin: {
        description: 'Marketing materials for affiliate',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Banner', value: 'banner' },
            { label: 'Email Template', value: 'email' },
            { label: 'Social Post', value: 'social' },
          ],
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'content',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this affiliate',
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
    {
      name: 'suspendedAt',
      type: 'date',
    },
    {
      name: 'suspendReason',
      type: 'textarea',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
};

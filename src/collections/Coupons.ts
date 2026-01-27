'use client';

import type { CollectionConfig } from 'payload';

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    group: 'Business',
    description: 'Discount codes and coupons',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { isActive: { equals: true } };
      if (user.role === 'admin') return true;
      return { isActive: { equals: true } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Coupon code (will be uppercased)',
      },
      hooks: {
        beforeChange: [
          ({ value }) => value?.toUpperCase(),
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Internal description',
      },
    },
    {
      name: 'discountType',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage', value: 'percent' },
        { label: 'Fixed Amount', value: 'fixed' },
      ],
    },
    {
      name: 'discountValue',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Percentage (0-100) or fixed amount in cents',
      },
    },
    {
      name: 'maxDiscountAmount',
      type: 'number',
      admin: {
        description: 'Maximum discount in cents (for percentage discounts)',
      },
    },
    {
      name: 'minPurchaseAmount',
      type: 'number',
      admin: {
        description: 'Minimum purchase amount in cents',
      },
    },
    {
      name: 'appliesTo',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'all',
          options: [
            { label: 'All Products', value: 'all' },
            { label: 'Specific Courses', value: 'courses' },
            { label: 'Subscriptions Only', value: 'subscriptions' },
            { label: 'Course Bundles Only', value: 'bundles' },
          ],
        },
        {
          name: 'courses',
          type: 'relationship',
          relationTo: 'courses',
          hasMany: true,
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'courses',
          },
        },
        {
          name: 'subscriptionPlans',
          type: 'relationship',
          relationTo: 'subscription-plans',
          hasMany: true,
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'subscriptions',
          },
        },
      ],
    },
    {
      name: 'restrictions',
      type: 'group',
      fields: [
        {
          name: 'maxRedemptions',
          type: 'number',
          admin: {
            description: 'Maximum total redemptions (null = unlimited)',
          },
        },
        {
          name: 'maxRedemptionsPerUser',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'Maximum redemptions per user',
          },
        },
        {
          name: 'firstPurchaseOnly',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Only valid for first-time purchases',
          },
        },
        {
          name: 'newUsersOnly',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Only valid for new accounts (< 7 days old)',
          },
        },
      ],
    },
    {
      name: 'duration',
      type: 'group',
      admin: {
        description: 'For subscription discounts',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Once', value: 'once' },
            { label: 'Repeating', value: 'repeating' },
            { label: 'Forever', value: 'forever' },
          ],
          defaultValue: 'once',
        },
        {
          name: 'months',
          type: 'number',
          admin: {
            description: 'Number of months (for repeating)',
            condition: (data, siblingData) => siblingData?.type === 'repeating',
          },
        },
      ],
    },
    {
      name: 'validity',
      type: 'group',
      fields: [
        {
          name: 'startsAt',
          type: 'date',
          admin: {
            description: 'When coupon becomes active',
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            description: 'When coupon expires',
          },
        },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      admin: {
        description: 'Stripe integration',
      },
      fields: [
        {
          name: 'couponId',
          type: 'text',
          admin: {
            description: 'Stripe Coupon ID',
          },
        },
        {
          name: 'promotionCodeId',
          type: 'text',
          admin: {
            description: 'Stripe Promotion Code ID',
          },
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      admin: {
        readOnly: true,
        description: 'Usage statistics',
      },
      fields: [
        {
          name: 'timesRedeemed',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'totalDiscountGiven',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total discount amount in cents',
          },
        },
        {
          name: 'lastUsedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
};

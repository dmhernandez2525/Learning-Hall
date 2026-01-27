'use client';

import type { CollectionConfig } from 'payload';

export const SubscriptionPlans: CollectionConfig = {
  slug: 'subscription-plans',
  admin: {
    useAsTitle: 'name',
    group: 'Business',
    description: 'Subscription plans available for purchase',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
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
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
        {
          name: 'included',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Price in cents',
          },
        },
        {
          name: 'currency',
          type: 'text',
          defaultValue: 'usd',
        },
        {
          name: 'interval',
          type: 'select',
          required: true,
          options: [
            { label: 'Monthly', value: 'month' },
            { label: 'Yearly', value: 'year' },
            { label: 'One-time', value: 'one_time' },
          ],
        },
        {
          name: 'intervalCount',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'Number of intervals between billings (e.g., 3 for quarterly)',
          },
        },
        {
          name: 'trialDays',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of trial days (0 for no trial)',
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
          name: 'priceId',
          type: 'text',
          required: true,
          admin: {
            description: 'Stripe Price ID',
          },
        },
        {
          name: 'productId',
          type: 'text',
          admin: {
            description: 'Stripe Product ID',
          },
        },
      ],
    },
    {
      name: 'access',
      type: 'group',
      admin: {
        description: 'What this plan grants access to',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'All Courses', value: 'all_courses' },
            { label: 'Specific Courses', value: 'specific_courses' },
            { label: 'Course Categories', value: 'categories' },
            { label: 'Course Tiers', value: 'tiers' },
          ],
        },
        {
          name: 'courses',
          type: 'relationship',
          relationTo: 'courses',
          hasMany: true,
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'specific_courses',
          },
        },
        {
          name: 'categories',
          type: 'array',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'categories',
          },
          fields: [
            {
              name: 'category',
              type: 'text',
            },
          ],
        },
        {
          name: 'tier',
          type: 'select',
          options: [
            { label: 'Basic', value: 'basic' },
            { label: 'Pro', value: 'pro' },
            { label: 'Enterprise', value: 'enterprise' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'tiers',
          },
        },
        {
          name: 'downloadableContent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Access to downloadable content',
          },
        },
        {
          name: 'prioritySupport',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'certificatesIncluded',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'limits',
      type: 'group',
      admin: {
        description: 'Usage limits for this plan',
      },
      fields: [
        {
          name: 'maxCourses',
          type: 'number',
          admin: {
            description: 'Max concurrent courses (null = unlimited)',
          },
        },
        {
          name: 'maxDownloads',
          type: 'number',
          admin: {
            description: 'Max downloads per month',
          },
        },
        {
          name: 'maxAIQuestions',
          type: 'number',
          admin: {
            description: 'Max AI assistant questions per month',
          },
        },
      ],
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in pricing table (lower = first)',
      },
    },
    {
      name: 'badge',
      type: 'text',
      admin: {
        description: 'Badge text (e.g., "Popular", "Best Value")',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isRecommended',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Highlight this plan as recommended',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'Leave empty for global plans',
      },
    },
  ],
};

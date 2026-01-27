'use client';

import type { CollectionConfig } from 'payload';

export const CourseBundles: CollectionConfig = {
  slug: 'course-bundles',
  admin: {
    useAsTitle: 'title',
    group: 'Business',
    description: 'Course bundles for discounted multi-course purchases',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 300,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      required: true,
      minRows: 2,
      admin: {
        description: 'Courses included in this bundle',
      },
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
            description: 'Bundle price in cents',
          },
        },
        {
          name: 'currency',
          type: 'text',
          defaultValue: 'usd',
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          admin: {
            description: 'Original price in cents (sum of individual courses)',
          },
        },
        {
          name: 'savingsPercent',
          type: 'number',
          admin: {
            description: 'Calculated savings percentage',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      fields: [
        {
          name: 'priceId',
          type: 'text',
          admin: {
            description: 'Stripe Price ID for this bundle',
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
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'startsAt',
          type: 'date',
          admin: {
            description: 'When bundle becomes available',
          },
        },
        {
          name: 'endsAt',
          type: 'date',
          admin: {
            description: 'When bundle expires',
          },
        },
        {
          name: 'maxPurchases',
          type: 'number',
          admin: {
            description: 'Maximum number of purchases (null = unlimited)',
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
          name: 'totalPurchases',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'totalRevenue',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total revenue in cents',
          },
        },
      ],
    },
    {
      name: 'badges',
      type: 'array',
      admin: {
        description: 'Promotional badges',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          admin: {
            description: 'Badge text (e.g., "Best Value", "Limited Time")',
          },
        },
        {
          name: 'color',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary', value: 'primary' },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Destructive', value: 'destructive' },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Calculate savings percentage
        if (data?.pricing?.amount && data?.pricing?.compareAtPrice) {
          const savings = ((data.pricing.compareAtPrice - data.pricing.amount) / data.pricing.compareAtPrice) * 100;
          data.pricing.savingsPercent = Math.round(savings);
        }
        return data;
      },
    ],
  },
};

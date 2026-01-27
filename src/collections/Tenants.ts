import type { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'plan', 'createdAt'],
    group: 'Admin',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      // Users can only see their own tenant
      return { id: { equals: req.user?.tenant } };
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { id: { equals: req.user?.tenant } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
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
        description: 'URL-friendly identifier (used for subdomains)',
      },
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#14b8a6',
          admin: {
            description: 'Primary brand color (hex)',
          },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'customDomain',
      type: 'text',
      admin: {
        description: 'Custom domain (e.g., courses.example.com)',
      },
    },
    {
      name: 'stripeAccountId',
      type: 'text',
      admin: {
        description: 'Stripe Connect account ID',
        position: 'sidebar',
      },
    },
    {
      name: 'settings',
      type: 'json',
      admin: {
        description: 'Additional tenant settings (JSON)',
      },
    },
  ],
  timestamps: true,
};

import type { CollectionConfig } from 'payload';

const MarketplaceReviews: CollectionConfig = {
  slug: 'marketplace-reviews',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['listing', 'reviewer', 'rating', 'createdAt'],
    group: 'Marketplace',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { reviewer: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'listing',
      type: 'relationship',
      relationTo: 'marketplace-listings',
      required: true,
    },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'comment',
      type: 'textarea',
      defaultValue: '',
      maxLength: 2000,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.reviewer) data.reviewer = req.user.id;
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default MarketplaceReviews;

import type { CollectionConfig, Where } from 'payload';

const MarketplacePurchases: CollectionConfig = {
  slug: 'marketplace-purchases',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['listing', 'buyer', 'price', 'status', 'createdAt'],
    group: 'Marketplace',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return {
        or: [
          { buyer: { equals: req.user.id } },
          { seller: { equals: req.user.id } },
        ],
      } as Where;
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => ['admin'].includes(req.user?.role || ''),
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
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'currency', type: 'text', defaultValue: 'USD', maxLength: 3 },
    {
      name: 'licenseType',
      type: 'select',
      options: [
        { label: 'Single Use', value: 'single-use' },
        { label: 'Unlimited', value: 'unlimited' },
        { label: 'Time Limited', value: 'time-limited' },
      ],
    },
    {
      name: 'licenseExpiresAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Refunded', value: 'refunded' },
      ],
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
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default MarketplacePurchases;

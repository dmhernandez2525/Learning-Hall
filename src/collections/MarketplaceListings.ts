import type { CollectionConfig } from 'payload';

const MarketplaceListings: CollectionConfig = {
  slug: 'marketplace-listings',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'seller', 'price', 'status', 'purchaseCount', 'updatedAt'],
    group: 'Marketplace',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return { status: { equals: 'active' } };
      if (req.user.role === 'admin') return true;
      return true;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { seller: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    { name: 'description', type: 'textarea', required: true, maxLength: 5000 },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      maxLength: 3,
    },
    {
      name: 'licenseType',
      type: 'select',
      defaultValue: 'single-use',
      options: [
        { label: 'Single Use', value: 'single-use' },
        { label: 'Unlimited', value: 'unlimited' },
        { label: 'Time Limited', value: 'time-limited' },
      ],
    },
    {
      name: 'licenseDurationDays',
      type: 'number',
      min: 1,
      admin: { condition: (data) => data?.licenseType === 'time-limited' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'category', type: 'text', defaultValue: '', maxLength: 100 },
    {
      name: 'tags',
      type: 'json',
      defaultValue: [],
      admin: { description: 'Array of tag strings' },
    },
    { name: 'previewUrl', type: 'text', defaultValue: '' },
    { name: 'thumbnailUrl', type: 'text', defaultValue: '' },
    { name: 'rating', type: 'number', defaultValue: 0, min: 0, max: 5 },
    { name: 'reviewCount', type: 'number', defaultValue: 0, min: 0 },
    { name: 'purchaseCount', type: 'number', defaultValue: 0, min: 0 },
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
          if (!data.seller) data.seller = req.user.id;
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default MarketplaceListings;

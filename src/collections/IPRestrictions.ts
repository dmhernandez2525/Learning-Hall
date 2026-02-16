import type { CollectionConfig } from 'payload';

const IPRestrictions: CollectionConfig = {
  slug: 'ip-restrictions',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'cidrRange', 'action', 'isActive'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    { name: 'label', type: 'text', required: true, maxLength: 200 },
    { name: 'cidrRange', type: 'text', required: true, maxLength: 50 },
    {
      name: 'action',
      type: 'select',
      required: true,
      defaultValue: 'allow',
      options: [
        { label: 'Allow', value: 'allow' },
        { label: 'Deny', value: 'deny' },
      ],
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
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

export default IPRestrictions;

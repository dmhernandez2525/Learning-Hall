import type { CollectionConfig } from 'payload';

const AuditRetentionPolicies: CollectionConfig = {
  slug: 'audit-retention-policies',
  admin: {
    defaultColumns: ['organization', 'retentionDays', 'autoExport', 'isActive'],
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
    { name: 'retentionDays', type: 'number', required: true, min: 30, max: 3650, defaultValue: 365 },
    { name: 'autoExport', type: 'checkbox', defaultValue: false },
    {
      name: 'exportFormat',
      type: 'select',
      defaultValue: 'csv',
      options: [
        { label: 'CSV', value: 'csv' },
        { label: 'JSON', value: 'json' },
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

export default AuditRetentionPolicies;

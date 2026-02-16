import type { CollectionConfig } from 'payload';

const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    defaultColumns: ['user', 'action', 'resource', 'resourceId', 'timestamp'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'action', type: 'text', required: true, maxLength: 100 },
    { name: 'resource', type: 'text', required: true, maxLength: 100 },
    { name: 'resourceId', type: 'text', required: true, maxLength: 100 },
    { name: 'details', type: 'json', defaultValue: {} },
    { name: 'ipAddress', type: 'text', defaultValue: '', maxLength: 50 },
    { name: 'userAgent', type: 'text', defaultValue: '', maxLength: 500 },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
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

export default AuditLogs;

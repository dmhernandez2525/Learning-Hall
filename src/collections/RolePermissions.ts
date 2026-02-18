import type { CollectionConfig } from 'payload';

const RolePermissions: CollectionConfig = {
  slug: 'role-permissions',
  admin: {
    defaultColumns: ['organization', 'role', 'resource', 'actions'],
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
    { name: 'role', type: 'text', required: true, maxLength: 50 },
    { name: 'resource', type: 'text', required: true, maxLength: 100 },
    { name: 'actions', type: 'json', required: true, defaultValue: [] },
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

export default RolePermissions;

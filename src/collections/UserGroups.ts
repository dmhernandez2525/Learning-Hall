import type { CollectionConfig } from 'payload';

const UserGroups: CollectionConfig = {
  slug: 'user-groups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'memberCount'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 200 },
    { name: 'description', type: 'textarea', defaultValue: '', maxLength: 2000 },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    { name: 'memberCount', type: 'number', defaultValue: 0, min: 0 },
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

export default UserGroups;

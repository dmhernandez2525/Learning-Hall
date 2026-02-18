import type { CollectionConfig } from 'payload';

const UserGroupMembers: CollectionConfig = {
  slug: 'user-group-members',
  admin: {
    defaultColumns: ['group', 'user', 'createdAt'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
  },
  fields: [
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'user-groups',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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

export default UserGroupMembers;

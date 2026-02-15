import type { CollectionConfig } from 'payload';

const OrgMemberships: CollectionConfig = {
  slug: 'org-memberships',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'organization', 'department', 'role', 'createdAt'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      return true;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'member',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Member', value: 'member' },
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

export default OrgMemberships;

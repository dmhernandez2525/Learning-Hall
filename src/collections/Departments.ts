import type { CollectionConfig } from 'payload';

const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'manager', 'memberCount', 'updatedAt'],
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
    { name: 'name', type: 'text', required: true, maxLength: 200 },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'parentDepartment',
      type: 'relationship',
      relationTo: 'departments',
      admin: { description: 'Parent department for nested structure' },
    },
    {
      name: 'manager',
      type: 'relationship',
      relationTo: 'users',
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

export default Departments;

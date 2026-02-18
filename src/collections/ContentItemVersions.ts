import type { CollectionConfig } from 'payload';

const ContentItemVersions: CollectionConfig = {
  slug: 'content-item-versions',
  admin: {
    defaultColumns: ['contentItem', 'versionNumber', 'createdBy', 'createdAt'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'contentItem',
      type: 'relationship',
      relationTo: 'content-items',
      required: true,
    },
    { name: 'versionNumber', type: 'number', required: true, min: 1 },
    { name: 'changelog', type: 'textarea', defaultValue: '', maxLength: 2000 },
    { name: 'fileUrl', type: 'text', required: true },
    { name: 'fileSize', type: 'number', defaultValue: 0, min: 0 },
    {
      name: 'createdBy',
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

export default ContentItemVersions;

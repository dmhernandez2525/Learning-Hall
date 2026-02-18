import type { CollectionConfig } from 'payload';

const ContentApprovals: CollectionConfig = {
  slug: 'content-approvals',
  admin: {
    defaultColumns: ['contentItem', 'reviewer', 'decision', 'createdAt'],
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
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'decision',
      type: 'select',
      required: true,
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Needs Changes', value: 'needs_changes' },
      ],
    },
    { name: 'comments', type: 'textarea', defaultValue: '', maxLength: 3000 },
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

export default ContentApprovals;

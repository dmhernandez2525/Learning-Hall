import type { CollectionConfig } from 'payload';

const ContentItems: CollectionConfig = {
  slug: 'content-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'status', 'versionCount'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 300 },
    { name: 'description', type: 'textarea', defaultValue: '', maxLength: 3000 },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'document',
      options: [
        { label: 'Document', value: 'document' },
        { label: 'Video', value: 'video' },
        { label: 'Image', value: 'image' },
        { label: 'Template', value: 'template' },
        { label: 'SCORM', value: 'scorm' },
      ],
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'currentVersion',
      type: 'relationship',
      relationTo: 'content-item-versions',
    },
    { name: 'versionCount', type: 'number', defaultValue: 0, min: 0 },
    { name: 'tags', type: 'json', defaultValue: [] },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending Review', value: 'pending_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users' },
    { name: 'approvedAt', type: 'date' },
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

export default ContentItems;

import type { CollectionConfig } from 'payload';

const ReportDefinitions: CollectionConfig = {
  slug: 'report-definitions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'reportType', 'status', 'lastRunAt'],
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
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'reportType',
      type: 'select',
      required: true,
      defaultValue: 'custom',
      options: [
        { label: 'Enrollment', value: 'enrollment' },
        { label: 'Completion', value: 'completion' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Revenue', value: 'revenue' },
        { label: 'Engagement', value: 'engagement' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    { name: 'columns', type: 'json', defaultValue: [] },
    { name: 'filters', type: 'json', defaultValue: [] },
    { name: 'schedule', type: 'json' },
    { name: 'lastRunAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
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

export default ReportDefinitions;

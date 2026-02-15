import type { CollectionConfig, Where } from 'payload';

const ComplianceAssignments: CollectionConfig = {
  slug: 'compliance-assignments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['requirement', 'user', 'status', 'dueDate', 'completedAt'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (['admin', 'instructor'].includes(req.user.role)) return true;
      return { user: { equals: req.user.id } } as Where;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'requirement',
      type: 'relationship',
      relationTo: 'compliance-requirements',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' },
      ],
    },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'courseProgressPercent', type: 'number', defaultValue: 0, min: 0, max: 100 },
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

export default ComplianceAssignments;

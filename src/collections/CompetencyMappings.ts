import type { CollectionConfig } from 'payload';

const CompetencyMappings: CollectionConfig = {
  slug: 'competency-mappings',
  admin: {
    defaultColumns: ['skill', 'course', 'targetLevel', 'weight'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'skill',
      type: 'relationship',
      relationTo: 'skills',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'targetLevel',
      type: 'select',
      required: true,
      defaultValue: 'intermediate',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Expert', value: 'expert' },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 0,
      max: 10,
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

export default CompetencyMappings;

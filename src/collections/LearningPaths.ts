import type { CollectionConfig } from 'payload';

const LearningPaths: CollectionConfig = {
  slug: 'learning-paths',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'instructor', 'enrollmentCount', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return { status: { equals: 'published' } };
      if (req.user.role === 'admin') return true;
      return true;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'estimatedHours', type: 'number', min: 0, defaultValue: 0 },
    { name: 'enrollmentCount', type: 'number', min: 0, defaultValue: 0 },
    {
      name: 'steps',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'stepId', type: 'text', required: true },
        { name: 'course', type: 'relationship', relationTo: 'courses', required: true },
        { name: 'order', type: 'number', required: true, min: 0 },
        { name: 'isRequired', type: 'checkbox', defaultValue: true },
        {
          name: 'prerequisiteStepIds',
          type: 'json',
          defaultValue: [],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.instructor) data.instructor = req.user.id;
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
          if (!data.slug && data.title) {
            data.slug = data.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
          }
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default LearningPaths;

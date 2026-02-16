import type { CollectionConfig } from 'payload';

const ContentSummaries: CollectionConfig = {
  slug: 'content-summaries',
  admin: { group: 'AI Content' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'instructor',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user?.tenant) data.tenant = req.user.tenant;
        return data;
      },
    ],
  },
  fields: [
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true },
    { name: 'lesson', type: 'relationship', relationTo: 'lessons', required: true },
    { name: 'originalLength', type: 'number', required: true, min: 0 },
    { name: 'summaryLength', type: 'number', required: true, min: 0 },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'keyPoints', type: 'json', required: true },
    { name: 'status', type: 'select', defaultValue: 'draft', options: ['draft', 'published'] },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', required: true },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default ContentSummaries;

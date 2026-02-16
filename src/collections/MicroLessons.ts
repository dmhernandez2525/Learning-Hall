import type { CollectionConfig } from 'payload';

const MicroLessons: CollectionConfig = {
  slug: 'micro-lessons',
  admin: { group: 'Microlearning' },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'instructor',
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
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea', required: true },
    { name: 'durationMinutes', type: 'number', required: true, min: 1 },
    { name: 'order', type: 'number', required: true, defaultValue: 0 },
    { name: 'status', type: 'select', defaultValue: 'draft', options: ['draft', 'published'] },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default MicroLessons;

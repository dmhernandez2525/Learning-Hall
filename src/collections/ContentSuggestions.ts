import type { CollectionConfig } from 'payload';

const ContentSuggestions: CollectionConfig = {
  slug: 'content-suggestions',
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
    { name: 'type', type: 'select', required: true, options: ['topic', 'example', 'exercise', 'explanation'] },
    { name: 'title', type: 'text', required: true, maxLength: 300 },
    { name: 'content', type: 'textarea', required: true },
    { name: 'status', type: 'select', defaultValue: 'pending', options: ['pending', 'accepted', 'rejected'] },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', required: true },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default ContentSuggestions;

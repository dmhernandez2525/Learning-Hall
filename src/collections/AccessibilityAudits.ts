import type { CollectionConfig } from 'payload';

const AccessibilityAudits: CollectionConfig = {
  slug: 'accessibility-audits',
  admin: { group: 'Accessibility' },
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
    { name: 'lesson', type: 'relationship', relationTo: 'lessons', required: true },
    { name: 'auditor', type: 'relationship', relationTo: 'users', required: true },
    { name: 'wcagLevel', type: 'select', required: true, options: ['A', 'AA', 'AAA'] },
    { name: 'score', type: 'number', required: true, min: 0, max: 100 },
    { name: 'issues', type: 'json', required: true },
    { name: 'status', type: 'select', defaultValue: 'pending', options: ['pending', 'in_progress', 'completed'] },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default AccessibilityAudits;

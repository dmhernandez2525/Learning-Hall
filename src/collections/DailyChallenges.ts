import type { CollectionConfig } from 'payload';

const DailyChallenges: CollectionConfig = {
  slug: 'daily-challenges',
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
    { name: 'title', type: 'text', required: true },
    { name: 'questions', type: 'json', required: true },
    { name: 'difficulty', type: 'select', required: true, options: ['easy', 'medium', 'hard'] },
    { name: 'points', type: 'number', required: true, min: 0 },
    { name: 'activeDate', type: 'date', required: true },
    { name: 'status', type: 'select', defaultValue: 'active', options: ['active', 'completed'] },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default DailyChallenges;

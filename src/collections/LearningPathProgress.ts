import type { CollectionConfig } from 'payload';

const LearningPathProgress: CollectionConfig = {
  slug: 'learning-path-progress',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['path', 'user', 'overallPercent', 'updatedAt'],
    group: 'Engagement',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { user: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'path',
      type: 'relationship',
      relationTo: 'learning-paths',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'user',
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
    { name: 'overallPercent', type: 'number', min: 0, max: 100, defaultValue: 0 },
    { name: 'enrolledAt', type: 'date', required: true },
    { name: 'completedAt', type: 'date' },
    {
      name: 'steps',
      type: 'json',
      defaultValue: [],
    },
  ],
  timestamps: true,
};

export default LearningPathProgress;

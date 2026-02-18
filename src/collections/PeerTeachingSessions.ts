import type { CollectionConfig } from 'payload';

const PeerTeachingSessions: CollectionConfig = {
  slug: 'peer-teaching-sessions',
  admin: { group: 'Social Learning' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
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
    { name: 'group', type: 'relationship', relationTo: 'study-groups', required: true },
    { name: 'teacher', type: 'relationship', relationTo: 'users', required: true },
    { name: 'topic', type: 'text', required: true, maxLength: 300 },
    { name: 'scheduledAt', type: 'date', required: true },
    { name: 'duration', type: 'number', required: true, min: 5, max: 240 },
    { name: 'status', type: 'select', defaultValue: 'scheduled', options: ['scheduled', 'active', 'completed'] },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default PeerTeachingSessions;

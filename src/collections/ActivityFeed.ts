import type { CollectionConfig } from 'payload';

const ActivityFeed: CollectionConfig = {
  slug: 'activity-feed',
  admin: { group: 'Community' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: () => false,
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
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'action', type: 'select', required: true, options: ['enrolled', 'completed', 'posted', 'reviewed', 'earned_badge'] },
    { name: 'targetType', type: 'text', required: true },
    { name: 'targetId', type: 'text', required: true },
    { name: 'targetTitle', type: 'text', required: true, maxLength: 300 },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default ActivityFeed;

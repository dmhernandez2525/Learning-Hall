import type { CollectionConfig } from 'payload';

const PushSubscriptions: CollectionConfig = {
  slug: 'push-subscriptions',
  admin: { group: 'Notifications' },
  access: {
    read: ({ req }) => !!req.user,
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
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'endpoint', type: 'text', required: true },
    { name: 'keys', type: 'json', required: true },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default PushSubscriptions;

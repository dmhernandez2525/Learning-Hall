import type { CollectionConfig, Where } from 'payload';

const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: { group: 'Notifications' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (['admin', 'instructor'].includes(req.user.role)) return true;
      return { user: { equals: req.user.id } } as Where;
    },
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
    { name: 'type', type: 'select', required: true, options: ['info', 'success', 'warning', 'alert'] },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'isRead', type: 'checkbox', defaultValue: false },
    { name: 'link', type: 'text', defaultValue: '' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default Notifications;

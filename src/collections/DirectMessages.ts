import type { CollectionConfig, Where } from 'payload';

const DirectMessages: CollectionConfig = {
  slug: 'direct-messages',
  admin: { group: 'Community' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return {
        or: [
          { sender: { equals: req.user.id } },
          { recipient: { equals: req.user.id } },
        ],
      } as Where;
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
    { name: 'sender', type: 'relationship', relationTo: 'users', required: true },
    { name: 'recipient', type: 'relationship', relationTo: 'users', required: true },
    { name: 'subject', type: 'text', required: true, maxLength: 300 },
    { name: 'body', type: 'textarea', required: true },
    { name: 'isRead', type: 'checkbox', defaultValue: false },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default DirectMessages;

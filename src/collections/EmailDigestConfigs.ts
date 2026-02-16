import type { CollectionConfig } from 'payload';

const EmailDigestConfigs: CollectionConfig = {
  slug: 'email-digest-configs',
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
    { name: 'frequency', type: 'select', required: true, options: ['daily', 'weekly', 'monthly'] },
    { name: 'isEnabled', type: 'checkbox', defaultValue: true },
    { name: 'lastSentAt', type: 'date' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default EmailDigestConfigs;

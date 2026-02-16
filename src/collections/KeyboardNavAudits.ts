import type { CollectionConfig } from 'payload';

const KeyboardNavAudits: CollectionConfig = {
  slug: 'keyboard-nav-audits',
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
    { name: 'pageUrl', type: 'text', required: true },
    { name: 'tabOrder', type: 'json', required: true },
    { name: 'trappedElements', type: 'json' },
    { name: 'missingFocus', type: 'json' },
    { name: 'passed', type: 'checkbox', defaultValue: false },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default KeyboardNavAudits;

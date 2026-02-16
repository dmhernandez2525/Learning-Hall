import type { CollectionConfig } from 'payload';

const ScreenReaderConfigs: CollectionConfig = {
  slug: 'screen-reader-configs',
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
    { name: 'ariaLandmarks', type: 'checkbox', defaultValue: false },
    { name: 'altTextCoverage', type: 'number', required: true, min: 0, max: 100 },
    { name: 'headingHierarchy', type: 'checkbox', defaultValue: false },
    { name: 'liveRegions', type: 'checkbox', defaultValue: false },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default ScreenReaderConfigs;

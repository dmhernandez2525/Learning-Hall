import type { CollectionConfig } from 'payload';

const BreakoutRooms: CollectionConfig = {
  slug: 'breakout-rooms',
  admin: { group: 'Virtual Classroom' },
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
    { name: 'session', type: 'relationship', relationTo: 'virtual-sessions', required: true },
    { name: 'name', type: 'text', required: true, maxLength: 200 },
    { name: 'capacity', type: 'number', required: true, min: 2, max: 50 },
    { name: 'participantCount', type: 'number', defaultValue: 0, min: 0 },
    { name: 'status', type: 'select', defaultValue: 'open', options: ['open', 'closed'] },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default BreakoutRooms;

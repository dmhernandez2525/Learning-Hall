import type { CollectionConfig } from 'payload';

const SessionParticipants: CollectionConfig = {
  slug: 'session-participants',
  admin: { group: 'Virtual Classroom' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
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
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'role', type: 'select', defaultValue: 'participant', options: ['host', 'presenter', 'participant'] },
    { name: 'joinedAt', type: 'date' },
    { name: 'leftAt', type: 'date' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default SessionParticipants;

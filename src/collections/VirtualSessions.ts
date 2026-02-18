import type { CollectionConfig } from 'payload';

const VirtualSessions: CollectionConfig = {
  slug: 'virtual-sessions',
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
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true },
    { name: 'title', type: 'text', required: true, maxLength: 300 },
    { name: 'description', type: 'textarea' },
    { name: 'host', type: 'relationship', relationTo: 'users', required: true },
    { name: 'scheduledAt', type: 'date', required: true },
    { name: 'duration', type: 'number', required: true, min: 5, max: 480 },
    { name: 'status', type: 'select', defaultValue: 'scheduled', options: ['scheduled', 'live', 'completed', 'cancelled'] },
    { name: 'maxParticipants', type: 'number', defaultValue: 100, min: 2, max: 1000 },
    { name: 'participantCount', type: 'number', defaultValue: 0, min: 0 },
    { name: 'recordingUrl', type: 'text' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default VirtualSessions;

import type { CollectionConfig } from 'payload';

const MentorProfiles: CollectionConfig = {
  slug: 'mentor-profiles',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'user', 'status', 'activeMenteeCount', 'updatedAt'],
    group: 'Mentorship',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      return true;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { user: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    { name: 'displayName', type: 'text', required: true, maxLength: 200 },
    { name: 'bio', type: 'textarea', required: true, maxLength: 2000 },
    {
      name: 'expertise',
      type: 'json',
      defaultValue: [],
      admin: { description: 'Array of expertise tags' },
    },
    {
      name: 'maxMentees',
      type: 'number',
      required: true,
      defaultValue: 5,
      min: 1,
      max: 50,
    },
    {
      name: 'activeMenteeCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'availableSlots',
      type: 'json',
      defaultValue: [],
      admin: { description: 'Weekly availability slots' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.user) data.user = req.user.id;
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default MentorProfiles;

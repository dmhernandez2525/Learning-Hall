import type { CollectionConfig } from 'payload';

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'status', 'enrolledAt', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin' || req.user.role === 'instructor') return true;
      return { user: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { user: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && !data.enrolledAt) {
          data.enrolledAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Expired', value: 'expired' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'enrolledAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?.status === 'completed',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Optional expiration date for time-limited access',
      },
    },
    {
      name: 'progress',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
      admin: {
        description: 'Overall course progress percentage',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
};

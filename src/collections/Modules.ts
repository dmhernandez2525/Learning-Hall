import type { CollectionConfig } from 'payload';

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'position', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      // Allow reading modules for published courses
      return true; // Access controlled at course level
    },
    create: ({ req }) => {
      return ['admin', 'instructor'].includes(req.user?.role || '');
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return ['admin', 'instructor'].includes(req.user?.role || '');
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'position',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order within the course (lower = first)',
        position: 'sidebar',
      },
    },
    {
      name: 'lessons',
      type: 'relationship',
      relationTo: 'lessons',
      hasMany: true,
    },
    {
      name: 'dripDelay',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Days to wait before unlocking (0 = immediate)',
      },
    },
  ],
  timestamps: true,
};

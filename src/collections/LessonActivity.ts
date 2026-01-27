import type { CollectionConfig } from 'payload';

const LessonActivity: CollectionConfig = {
  slug: 'lesson-activity',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'lesson', 'lastViewedAt', 'lastPosition'],
    group: 'Engagement',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
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
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
    },
    {
      name: 'lastPosition',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'lastViewedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.user) {
          data.user = req.user.id;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default LessonActivity;

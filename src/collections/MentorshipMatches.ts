import type { CollectionConfig, Where } from 'payload';

const MentorshipMatches: CollectionConfig = {
  slug: 'mentorship-matches',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['mentor', 'mentee', 'course', 'status', 'matchedAt'],
    group: 'Mentorship',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return {
        or: [
          { mentor: { equals: req.user.id } },
          { mentee: { equals: req.user.id } },
        ],
      } as Where;
    },
    create: ({ req }) => ['admin', 'instructor', 'student'].includes(req.user?.role || ''),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return {
        or: [
          { mentor: { equals: req.user.id } },
          { mentee: { equals: req.user.id } },
        ],
      } as Where;
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'mentor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'mentee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'matchedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
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
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default MentorshipMatches;

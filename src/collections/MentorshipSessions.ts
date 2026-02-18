import type { CollectionConfig, Where } from 'payload';

const MentorshipSessions: CollectionConfig = {
  slug: 'mentorship-sessions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['match', 'scheduledAt', 'durationMinutes', 'status', 'menteeRating'],
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
    create: ({ req }) => Boolean(req.user),
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
      name: 'match',
      type: 'relationship',
      relationTo: 'mentorship-matches',
      required: true,
    },
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
      name: 'scheduledAt',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      required: true,
      defaultValue: 30,
      min: 15,
      max: 180,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No-show', value: 'no-show' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      defaultValue: '',
      maxLength: 5000,
    },
    {
      name: 'menteeRating',
      type: 'number',
      min: 1,
      max: 5,
    },
    {
      name: 'menteeFeedback',
      type: 'textarea',
      defaultValue: '',
      maxLength: 2000,
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

export default MentorshipSessions;

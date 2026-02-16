import type { CollectionConfig, Where } from 'payload';

const UserSkillAssessments: CollectionConfig = {
  slug: 'user-skill-assessments',
  admin: {
    defaultColumns: ['user', 'skill', 'currentLevel', 'targetLevel', 'assessedAt'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (['admin', 'instructor'].includes(req.user.role || '')) return true;
      return { user: { equals: req.user.id } } as Where;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'skill',
      type: 'relationship',
      relationTo: 'skills',
      required: true,
    },
    {
      name: 'currentLevel',
      type: 'select',
      required: true,
      defaultValue: 'beginner',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Expert', value: 'expert' },
      ],
    },
    {
      name: 'targetLevel',
      type: 'select',
      required: true,
      defaultValue: 'intermediate',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Expert', value: 'expert' },
      ],
    },
    {
      name: 'assessedAt',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Course Completion', value: 'course_completion' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Peer Review', value: 'peer_review' },
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
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default UserSkillAssessments;

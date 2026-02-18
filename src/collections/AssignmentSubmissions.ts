import type { CollectionConfig } from 'payload';

const AssignmentSubmissions: CollectionConfig = {
  slug: 'assignment-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['assignment', 'student', 'status', 'submittedAt', 'score'],
    group: 'Engagement',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'instructor') return true;
      return { student: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'assignment',
      type: 'relationship',
      relationTo: 'assignments',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Graded', value: 'graded' },
        { label: 'Returned', value: 'returned' },
      ],
    },
    { name: 'content', type: 'textarea', defaultValue: '' },
    { name: 'fileUrl', type: 'text' },
    { name: 'linkUrl', type: 'text' },
    { name: 'submittedAt', type: 'date' },
    { name: 'isLate', type: 'checkbox', defaultValue: false },
    { name: 'submissionVersion', type: 'number', defaultValue: 1, min: 1 },
    { name: 'score', type: 'number', min: 0 },
    { name: 'feedback', type: 'textarea' },
    {
      name: 'rubricScores',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'criterionId', type: 'text', required: true },
        { name: 'score', type: 'number', required: true, min: 0 },
        { name: 'comment', type: 'textarea' },
      ],
    },
    { name: 'gradedBy', type: 'relationship', relationTo: 'users' },
    { name: 'gradedAt', type: 'date' },
    {
      name: 'peerReviews',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'reviewerId', type: 'text', required: true },
        { name: 'score', type: 'number', min: 0 },
        { name: 'feedback', type: 'textarea' },
        { name: 'reviewedAt', type: 'date' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.student) data.student = req.user.id;
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default AssignmentSubmissions;

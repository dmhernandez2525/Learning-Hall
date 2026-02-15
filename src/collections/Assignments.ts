import type { CollectionConfig } from 'payload';

const Assignments: CollectionConfig = {
  slug: 'assignments',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'dueDate', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return true;
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'description',
      type: 'textarea',
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
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      admin: { position: 'sidebar', description: 'Optional: link to a specific lesson' },
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar', readOnly: true },
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
        { label: 'Published', value: 'published' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'maxScore', type: 'number', required: true, min: 1, defaultValue: 100 },
    { name: 'allowLateSubmission', type: 'checkbox', defaultValue: false },
    { name: 'latePenaltyPercent', type: 'number', min: 0, max: 100, defaultValue: 10 },
    { name: 'maxResubmissions', type: 'number', min: 0, defaultValue: 0 },
    {
      name: 'submissionTypes',
      type: 'select',
      hasMany: true,
      defaultValue: ['text'],
      options: [
        { label: 'Text', value: 'text' },
        { label: 'File Upload', value: 'file' },
        { label: 'URL', value: 'url' },
      ],
    },
    {
      name: 'rubric',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'criterionId', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'maxPoints', type: 'number', required: true, min: 0 },
      ],
    },
    { name: 'enablePeerReview', type: 'checkbox', defaultValue: false },
    { name: 'peerReviewsRequired', type: 'number', min: 1, max: 5, defaultValue: 2 },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.instructor) data.instructor = req.user.id;
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default Assignments;

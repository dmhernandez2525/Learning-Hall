import type { CollectionConfig } from 'payload';

const LessonVideoMetadata: CollectionConfig = {
  slug: 'lesson-video-metadata',
  admin: {
    useAsTitle: 'lesson',
    defaultColumns: ['lesson', 'course', 'updatedAt'],
    group: 'Engagement',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
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
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'chapters',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'timestamp', type: 'number', required: true, min: 0 },
      ],
    },
    {
      name: 'hotspots',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'startTime', type: 'number', required: true, min: 0 },
        { name: 'endTime', type: 'number', required: true, min: 0 },
        { name: 'x', type: 'number', required: true, min: 0, max: 100 },
        { name: 'y', type: 'number', required: true, min: 0, max: 100 },
        { name: 'width', type: 'number', required: true, min: 1, max: 100 },
        { name: 'height', type: 'number', required: true, min: 1, max: 100 },
        { name: 'resourceUrl', type: 'text', required: true },
      ],
    },
    {
      name: 'annotations',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
        { name: 'timestamp', type: 'number', required: true, min: 0 },
        { name: 'duration', type: 'number', required: true, min: 1, defaultValue: 4 },
      ],
    },
    {
      name: 'transcriptVtt',
      type: 'textarea',
      defaultValue: '',
    },
    {
      name: 'qualityOptions',
      type: 'array',
      defaultValue: [],
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'mimeType', type: 'text' },
      ],
    },
  ],
  timestamps: true,
};

export default LessonVideoMetadata;

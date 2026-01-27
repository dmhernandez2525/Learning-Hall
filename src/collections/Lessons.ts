import type { CollectionConfig } from 'payload';

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'contentType', 'position', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return true; // Access controlled at course/enrollment level
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
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
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
        description: 'Order within the module',
        position: 'sidebar',
      },
    },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'video',
      options: [
        { label: 'Video', value: 'video' },
        { label: 'Text', value: 'text' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
      ],
    },
    {
      name: 'content',
      type: 'group',
      fields: [
        // Video content
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            condition: (data) => data?.contentType === 'video',
            description: 'URL to the video (HLS playlist or direct URL)',
          },
        },
        {
          name: 'videoDuration',
          type: 'number',
          admin: {
            condition: (data) => data?.contentType === 'video',
            description: 'Duration in seconds',
          },
        },
        {
          name: 'videoThumbnail',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (data) => data?.contentType === 'video',
          },
        },
        // Text content
        {
          name: 'textContent',
          type: 'richText',
          admin: {
            condition: (data) => data?.contentType === 'text',
          },
        },
        // Quiz content (simplified - will be expanded later)
        {
          name: 'quizData',
          type: 'json',
          admin: {
            condition: (data) => data?.contentType === 'quiz',
            description: 'Quiz questions and answers (JSON)',
          },
        },
        // Assignment content
        {
          name: 'assignmentInstructions',
          type: 'richText',
          admin: {
            condition: (data) => data?.contentType === 'assignment',
          },
        },
      ],
    },
    {
      name: 'isPreview',
      type: 'checkbox',
      defaultValue: false,
      label: 'Free preview',
      admin: {
        description: 'Allow non-enrolled users to preview this lesson',
        position: 'sidebar',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      admin: {
        description: 'Estimated time to complete (minutes)',
      },
    },
    {
      name: 'resources',
      type: 'array',
      admin: {
        description: 'Downloadable resources',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
};

import type { CollectionConfig } from 'payload';
import { lessonEditor } from '../lib/editor/lessonEditor';

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'contentType', 'position', 'updatedAt'],
    group: 'Content',
    description: 'Individual lessons within course modules',
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
      minLength: 3,
      maxLength: 200,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from title if not provided',
      },
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
        description: 'Order within the module (lower = earlier)',
        position: 'sidebar',
      },
    },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Rich Text', value: 'text' },
        { label: 'Video', value: 'video' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
        { label: 'Mixed (Text + Video)', value: 'mixed' },
      ],
      admin: {
        description: 'Primary content type for this lesson',
      },
    },
    // Main rich text content - shown for text and mixed types
    {
      name: 'richContent',
      type: 'richText',
      editor: lessonEditor,
      admin: {
        description: 'Main lesson content with full formatting support',
        condition: (data) => ['text', 'mixed', 'assignment'].includes(data?.contentType),
      },
    },
    // Video content group
    {
      name: 'videoContent',
      type: 'group',
      admin: {
        condition: (data) => ['video', 'mixed'].includes(data?.contentType),
      },
      fields: [
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Upload a video file or select from media library',
          },
        },
        {
          name: 'externalUrl',
          type: 'text',
          admin: {
            description: 'Or provide an external video URL (YouTube, Vimeo, HLS)',
          },
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Video duration in seconds',
          },
        },
        {
          name: 'transcript',
          type: 'richText',
          editor: lessonEditor,
          admin: {
            description: 'Video transcript for accessibility',
          },
        },
        {
          name: 'chapters',
          type: 'array',
          admin: {
            description: 'Video chapters/timestamps',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'timestamp',
              type: 'number',
              required: true,
              admin: {
                description: 'Start time in seconds',
              },
            },
          ],
        },
      ],
    },
    // Quiz content
    {
      name: 'quizContent',
      type: 'group',
      admin: {
        condition: (data) => data?.contentType === 'quiz',
      },
      fields: [
        {
          name: 'mode',
          type: 'select',
          defaultValue: 'engine',
          options: [
            { label: 'Advanced Quiz Engine', value: 'engine' },
            { label: 'Inline Builder', value: 'inline' },
          ],
          admin: {
            description: 'Use the quiz engine for analytics or stay with inline questions.',
          },
        },
        {
          name: 'quiz',
          type: 'relationship',
          relationTo: 'quizzes',
          admin: {
            condition: (_, siblingData) => siblingData?.mode === 'engine',
            description: 'Select a published quiz to embed in this lesson',
          },
        },
        {
          name: 'instructions',
          type: 'richText',
          editor: lessonEditor,
          admin: {
            description: 'Quiz instructions shown before starting',
            condition: (_, siblingData) => siblingData?.mode !== 'engine',
          },
        },
        {
          name: 'passingScore',
          type: 'number',
          defaultValue: 70,
          min: 0,
          max: 100,
          admin: {
            description: 'Minimum score (%) to pass',
            condition: (_, siblingData) => siblingData?.mode !== 'engine',
          },
        },
        {
          name: 'allowRetakes',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (_, siblingData) => siblingData?.mode !== 'engine',
          },
        },
        {
          name: 'showCorrectAnswers',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show correct answers after submission',
            condition: (_, siblingData) => siblingData?.mode !== 'engine',
          },
        },
        {
          name: 'questions',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.mode !== 'engine',
          },
          fields: [
            {
              name: 'question',
              type: 'richText',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'multiple_choice',
              options: [
                { label: 'Multiple Choice', value: 'multiple_choice' },
                { label: 'True/False', value: 'true_false' },
                { label: 'Short Answer', value: 'short_answer' },
              ],
            },
            {
              name: 'options',
              type: 'array',
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.type === 'multiple_choice',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'isCorrect',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'correctAnswer',
              type: 'text',
              admin: {
                condition: (_, siblingData) =>
                  ['true_false', 'short_answer'].includes(siblingData?.type),
                description: 'For true/false: "true" or "false". For short answer: expected text.',
              },
            },
            {
              name: 'explanation',
              type: 'richText',
              admin: {
                description: 'Explanation shown after answering',
              },
            },
            {
              name: 'points',
              type: 'number',
              defaultValue: 1,
              min: 0,
            },
          ],
        },
      ],
    },
    // Assignment content
    {
      name: 'assignmentContent',
      type: 'group',
      admin: {
        condition: (data) => data?.contentType === 'assignment',
      },
      fields: [
        {
          name: 'dueDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'submissionType',
          type: 'select',
          defaultValue: 'file',
          options: [
            { label: 'File Upload', value: 'file' },
            { label: 'Text Entry', value: 'text' },
            { label: 'URL', value: 'url' },
          ],
        },
        {
          name: 'maxFileSize',
          type: 'number',
          defaultValue: 10,
          admin: {
            description: 'Maximum file size in MB',
            condition: (_, siblingData) => siblingData?.submissionType === 'file',
          },
        },
        {
          name: 'rubric',
          type: 'richText',
          editor: lessonEditor,
          admin: {
            description: 'Grading rubric',
          },
        },
      ],
    },
    // Common fields
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Brief summary shown in lesson list (max 500 chars)',
      },
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
        position: 'sidebar',
      },
    },
    {
      name: 'resources',
      type: 'array',
      admin: {
        description: 'Downloadable resources and attachments',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'Search engine optimization',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-generate slug from title
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

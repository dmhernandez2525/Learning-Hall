import type { CollectionConfig, Where } from 'payload';

export const CourseTemplates: CollectionConfig = {
  slug: 'course-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    description: 'Reusable course structure templates',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Public templates readable by instructors
      return {
        or: [
          { isPublic: { equals: true } },
          { createdBy: { equals: user.id } },
          { tenant: { equals: user.tenant } },
        ],
      } as Where;
    },
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { createdBy: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { createdBy: { equals: user?.id } };
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Technical', value: 'technical' },
        { label: 'Business', value: 'business' },
        { label: 'Creative', value: 'creative' },
        { label: 'Academic', value: 'academic' },
        { label: 'Certification', value: 'certification' },
        { label: 'Onboarding', value: 'onboarding' },
        { label: 'Compliance', value: 'compliance' },
      ],
      index: true,
    },
    {
      name: 'structure',
      type: 'array',
      admin: { description: 'Template module and lesson structure' },
      fields: [
        {
          name: 'moduleTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'moduleDescription',
          type: 'textarea',
        },
        {
          name: 'lessons',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Video', value: 'video' },
                { label: 'Text', value: 'text' },
                { label: 'Quiz', value: 'quiz' },
                { label: 'Assignment', value: 'assignment' },
                { label: 'Discussion', value: 'discussion' },
                { label: 'Live Session', value: 'live' },
                { label: 'SCORM', value: 'scorm' },
              ],
            },
            {
              name: 'estimatedDuration',
              type: 'number',
              admin: { description: 'Estimated duration in minutes' },
            },
            {
              name: 'instructions',
              type: 'textarea',
              admin: { description: 'Instructions for content creator' },
            },
          ],
        },
        {
          name: 'hasQuiz',
          type: 'checkbox',
          admin: { description: 'Include module quiz' },
        },
      ],
    },
    {
      name: 'defaultSettings',
      type: 'group',
      admin: { description: 'Default settings for courses using this template' },
      fields: [
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ],
        },
        {
          name: 'hasCertificate',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'isSequential',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Require lessons to be completed in order' },
        },
        {
          name: 'hasDiscussions',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'estimatedDuration',
      type: 'group',
      fields: [
        {
          name: 'hours',
          type: 'number',
        },
        {
          name: 'weeks',
          type: 'number',
          admin: { description: 'Suggested completion timeline' },
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Make template available to all instructors' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Feature in template gallery (admin only)' },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, description: 'Number of courses created from template' },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ],
  timestamps: true,
};

import type { CollectionConfig } from 'payload';

export const ContentTemplates: CollectionConfig = {
  slug: 'content-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    description: 'Reusable content templates for lessons and courses',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Template name',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this template',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Lesson', value: 'lesson' },
        { label: 'Section', value: 'section' },
        { label: 'Course', value: 'course' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Video Lesson', value: 'video' },
        { label: 'Text Lesson', value: 'text' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Assessment', value: 'assessment' },
        { label: 'Project', value: 'project' },
        { label: 'Bootcamp', value: 'bootcamp' },
        { label: 'Tutorial', value: 'tutorial' },
      ],
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Template content structure',
      },
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'estimatedDuration',
          type: 'number',
          admin: {
            description: 'Estimated duration in minutes',
          },
        },
        {
          name: 'difficulty',
          type: 'select',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ],
        },
        {
          name: 'includeQuiz',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'includeAssignment',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Make this template available to all users',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
};

export default ContentTemplates;

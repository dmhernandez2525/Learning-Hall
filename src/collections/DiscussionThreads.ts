import type { CollectionConfig } from 'payload';
import { lessonEditor } from '@/lib/editor/lessonEditor';

const DiscussionThreads: CollectionConfig = {
  slug: 'discussion-threads',
  admin: {
    group: 'Community',
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'status', 'isPinned', 'updatedAt'],
    description: 'Per-course discussion threads with instructor moderation',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      if (['admin', 'instructor'].includes(req.user.role)) return true;
      return { author: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      minLength: 5,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Generated automatically from the title if left empty',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'body',
      type: 'richText',
      editor: lessonEditor,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Answered', value: 'answered' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'isPinned',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isAnswered',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'answerPost',
      type: 'relationship',
      relationTo: 'discussion-posts',
      admin: {
        condition: (data) => data?.isAnswered,
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Topic tags to help students filter threads',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
    },
    {
      name: 'voteScore',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'votes',
      type: 'array',
      admin: {
        description: 'Individual votes for deduping (managed via API)',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'value',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'subscribers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Subscribers receive notifications for new replies',
      },
    },
    {
      name: 'replyCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'lastActivityAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.author) {
          data.author = req.user.id;
        }
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        if (!data.lastActivityAt) {
          data.lastActivityAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default DiscussionThreads;

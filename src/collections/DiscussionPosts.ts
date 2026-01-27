import type { CollectionConfig } from 'payload';
import { lessonEditor } from '@/lib/editor/lessonEditor';

const DiscussionPosts: CollectionConfig = {
  slug: 'discussion-posts',
  admin: {
    group: 'Community',
    useAsTitle: 'id',
    defaultColumns: ['thread', 'author', 'parent', 'voteScore', 'createdAt'],
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
      name: 'thread',
      type: 'relationship',
      relationTo: 'discussion-threads',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'discussion-posts',
      admin: {
        description: 'Optional parent post for nested replies',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lessonEditor,
      required: true,
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
        description: 'Managed programmatically to prevent duplicate voting',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'value',
          type: 'number',
        },
      ],
    },
    {
      name: 'isAnswer',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'depth',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.author) {
          data.author = req.user.id;
        }
        if (operation === 'create') {
          if (data.parent) {
            try {
              const parent = await req.payload?.findByID?.({
                collection: 'discussion-posts',
                id: typeof data.parent === 'object' ? data.parent.id : data.parent,
              });
              const parentDepth = parent?.depth ? Number(parent.depth) : 0;
              data.depth = parentDepth + 1;
            } catch {
              data.depth = 1;
            }
          } else {
            data.depth = 0;
          }
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default DiscussionPosts;

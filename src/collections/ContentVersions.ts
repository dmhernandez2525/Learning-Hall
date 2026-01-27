import type { CollectionConfig } from 'payload';

export const ContentVersions: CollectionConfig = {
  slug: 'content-versions',
  admin: {
    useAsTitle: 'id',
    group: 'Content',
    description: 'Version history for lessons and content',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { author: { equals: user.id } };
    },
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    update: () => false, // Versions are immutable
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      index: true,
    },
    {
      name: 'version',
      type: 'number',
      required: true,
      admin: { description: 'Version number (auto-incremented)' },
    },
    {
      name: 'content',
      type: 'richText',
      admin: { description: 'Snapshot of lesson content at this version' },
    },
    {
      name: 'contentJson',
      type: 'json',
      admin: { description: 'Raw JSON content for complex content types' },
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'duration',
          type: 'number',
        },
      ],
    },
    {
      name: 'changeType',
      type: 'select',
      options: [
        { label: 'Major Update', value: 'major' },
        { label: 'Minor Update', value: 'minor' },
        { label: 'Bug Fix', value: 'fix' },
        { label: 'Auto Save', value: 'autosave' },
        { label: 'Publish', value: 'publish' },
        { label: 'Rollback', value: 'rollback' },
      ],
    },
    {
      name: 'changeDescription',
      type: 'textarea',
      admin: { description: 'Description of changes in this version' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'diff',
      type: 'json',
      admin: { description: 'Computed diff from previous version' },
    },
    {
      name: 'previousVersion',
      type: 'relationship',
      relationTo: 'content-versions',
    },
    {
      name: 'wordCount',
      type: 'number',
    },
    {
      name: 'checksum',
      type: 'text',
      admin: { description: 'Content hash for integrity verification' },
    },
  ],
  timestamps: true,
};

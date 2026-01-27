import type { CollectionConfig } from 'payload';

export const SearchIndex: CollectionConfig = {
  slug: 'search-index',
  admin: {
    useAsTitle: 'title',
    group: 'System',
    description: 'Search index for courses and content',
  },
  access: {
    read: () => true, // Search index is public
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'entityType',
      type: 'select',
      required: true,
      options: [
        { label: 'Course', value: 'course' },
        { label: 'Lesson', value: 'lesson' },
        { label: 'Module', value: 'module' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Discussion Thread', value: 'discussion' },
        { label: 'Instructor', value: 'instructor' },
      ],
      index: true,
    },
    {
      name: 'entityId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'textarea',
      admin: { description: 'Full-text content for search' },
    },
    {
      name: 'keywords',
      type: 'array',
      fields: [{ name: 'keyword', type: 'text' }],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'category',
      type: 'text',
      index: true,
    },
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
      name: 'instructor',
      type: 'group',
      fields: [
        { name: 'id', type: 'text' },
        { name: 'name', type: 'text' },
      ],
    },
    {
      name: 'thumbnail',
      type: 'text',
      admin: { description: 'Thumbnail URL' },
    },
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
        },
        {
          name: 'reviewCount',
          type: 'number',
        },
        {
          name: 'enrollmentCount',
          type: 'number',
        },
        {
          name: 'completionRate',
          type: 'number',
          min: 0,
          max: 100,
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'price',
          type: 'number',
        },
        {
          name: 'currency',
          type: 'text',
        },
        {
          name: 'isFree',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'en',
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
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Hidden', value: 'hidden' },
        { label: 'Pending', value: 'pending' },
      ],
      index: true,
    },
    {
      name: 'boostScore',
      type: 'number',
      defaultValue: 1,
      admin: { description: 'Search ranking boost multiplier' },
    },
    {
      name: 'lastIndexedAt',
      type: 'date',
    },
  ],
  timestamps: true,
};

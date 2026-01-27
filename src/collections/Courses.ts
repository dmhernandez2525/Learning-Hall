import type { CollectionConfig } from 'payload';
import { getPayload } from 'payload';
import config from '../payload.config';

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'instructor', 'status', 'price', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
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
      async ({ data, req, operation }) => {
        // Set instructor to current user on create
        if (operation === 'create' && !data.instructor) {
          data.instructor = req.user?.id;
        }
        return data;
      },
      async ({ data, req, operation }) => {
        if (data.status === 'published') {
            const payload = await getPayload({ config });
            const course = await payload.findByID({
                collection: 'courses',
                id: data.id,
                depth: 2,
            });

            if(!course.modules || course.modules.length === 0) {
                throw new Error('A course must have at least one module to be published.');
            }

            const hasLessons = course.modules.some(module => module.lessons && module.lessons.length > 0);

            if(!hasLessons) {
                throw new Error('A course must have at least one lesson to be published.');
            }

            if(operation === 'update') {
                data.publishedAt = new Date().toISOString();
            }

        }
        return data;
      }
    ],
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
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Brief description for course cards (max 300 chars)',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'group',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Price in cents (0 = free)',
          },
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          defaultValue: 'USD',
          options: [
            { label: 'USD ($)', value: 'USD' },
            { label: 'EUR (€)', value: 'EUR' },
            { label: 'GBP (£)', value: 'GBP' },
          ],
        },
      ],
    },
    {
      name: 'modules',
      type: 'relationship',
      relationTo: 'modules',
      hasMany: true,
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'allowPreview',
          type: 'checkbox',
          defaultValue: true,
          label: 'Allow preview lessons',
        },
        {
          name: 'requireSequentialProgress',
          type: 'checkbox',
          defaultValue: false,
          label: 'Require sequential lesson completion',
        },
        {
          name: 'certificateEnabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Issue certificate on completion',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
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
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
};

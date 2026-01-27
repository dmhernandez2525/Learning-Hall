import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true, // Public access to media
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { uploadedBy: { equals: req.user?.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    staticDir: 'media',
    // We'll override this with BYOS in production
    mimeTypes: [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      'application/zip',
      'text/plain',
      'text/markdown',
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          data.uploadedBy = req.user?.id;
          data.tenant = req.user?.tenant;
        }
        return data;
      },
    ],
  },
};

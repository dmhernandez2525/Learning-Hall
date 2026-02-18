import type { CollectionConfig } from 'payload';

const CollaborativeNotes: CollectionConfig = {
  slug: 'collaborative-notes',
  admin: { group: 'Social Learning' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user?.tenant) data.tenant = req.user.tenant;
        return data;
      },
    ],
  },
  fields: [
    { name: 'group', type: 'relationship', relationTo: 'study-groups', required: true },
    { name: 'title', type: 'text', required: true, maxLength: 300 },
    { name: 'content', type: 'textarea', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'lastEditedAt', type: 'date' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default CollaborativeNotes;

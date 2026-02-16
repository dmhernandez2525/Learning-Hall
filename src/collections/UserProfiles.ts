import type { CollectionConfig } from 'payload';

const UserProfiles: CollectionConfig = {
  slug: 'user-profiles',
  admin: { group: 'Community' },
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
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, unique: true },
    { name: 'displayName', type: 'text', required: true, maxLength: 100 },
    { name: 'bio', type: 'textarea', maxLength: 2000 },
    { name: 'avatarUrl', type: 'text' },
    { name: 'interests', type: 'json' },
    { name: 'isPublic', type: 'checkbox', defaultValue: true },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default UserProfiles;

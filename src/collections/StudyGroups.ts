import type { CollectionConfig } from 'payload';

const StudyGroups: CollectionConfig = {
  slug: 'study-groups',
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
    { name: 'name', type: 'text', required: true, maxLength: 200 },
    { name: 'description', type: 'textarea', maxLength: 2000 },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true },
    { name: 'maxMembers', type: 'number', defaultValue: 20, min: 2, max: 100 },
    { name: 'memberCount', type: 'number', defaultValue: 0, min: 0 },
    { name: 'isPublic', type: 'checkbox', defaultValue: true },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', required: true },
    { name: 'members', type: 'relationship', relationTo: 'users', hasMany: true },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default StudyGroups;

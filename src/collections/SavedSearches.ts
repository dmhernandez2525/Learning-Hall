import type { CollectionConfig } from 'payload';

const SavedSearches: CollectionConfig = {
  slug: 'saved-searches',
  admin: { group: 'Search' },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
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
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'query', type: 'text', required: true },
    { name: 'filters', type: 'json', defaultValue: [] },
    { name: 'resultCount', type: 'number', defaultValue: 0 },
    { name: 'lastRunAt', type: 'date' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default SavedSearches;

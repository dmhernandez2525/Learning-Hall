import type { CollectionConfig } from 'payload';

const SearchQueries: CollectionConfig = {
  slug: 'search-queries',
  admin: { group: 'Search' },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => !!req.user,
    update: () => false,
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
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'query', type: 'text', required: true },
    { name: 'resultCount', type: 'number', defaultValue: 0 },
    { name: 'searchType', type: 'select', options: ['course', 'lesson', 'discussion', 'user', 'all'], defaultValue: 'all' },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default SearchQueries;

import type { CollectionConfig } from 'payload';

export const SearchAnalytics: CollectionConfig = {
  slug: 'search-analytics',
  admin: {
    useAsTitle: 'query',
    group: 'Analytics',
    description: 'Search query analytics and trending data',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    create: () => true, // Allow system to create
    update: () => true, // Allow system to update
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'query',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'normalizedQuery',
      type: 'text',
      index: true,
      admin: { description: 'Lowercase, trimmed query for aggregation' },
    },
    {
      name: 'searchCount',
      type: 'number',
      defaultValue: 1,
      admin: { description: 'Number of times this query was searched' },
    },
    {
      name: 'resultsCount',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Average number of results returned' },
    },
    {
      name: 'clickThroughRate',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
      admin: { description: 'Percentage of searches that resulted in clicks' },
    },
    {
      name: 'clicks',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'conversions',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Searches that led to enrollments' },
    },
    {
      name: 'averagePosition',
      type: 'number',
      admin: { description: 'Average position of clicked results' },
    },
    {
      name: 'zeroResultsCount',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Number of times this query returned no results' },
    },
    {
      name: 'filters',
      type: 'json',
      admin: { description: 'Commonly used filters with this query' },
    },
    {
      name: 'topResults',
      type: 'array',
      fields: [
        { name: 'courseId', type: 'text' },
        { name: 'clicks', type: 'number' },
        { name: 'position', type: 'number' },
      ],
      admin: { description: 'Most clicked results for this query' },
    },
    {
      name: 'lastSearchedAt',
      type: 'date',
    },
    {
      name: 'firstSearchedAt',
      type: 'date',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
  ],
  timestamps: true,
};

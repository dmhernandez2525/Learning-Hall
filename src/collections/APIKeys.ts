import type { CollectionConfig } from 'payload';

export const APIKeys: CollectionConfig = {
  slug: 'api-keys',
  admin: {
    useAsTitle: 'name',
    group: 'Integrations',
    description: 'API keys for external integrations',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Friendly name for this API key' },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'API key (only shown once on creation)',
      },
    },
    {
      name: 'keyPrefix',
      type: 'text',
      admin: {
        description: 'Key prefix for identification (e.g., "lh_live_")',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'permissions',
      type: 'group',
      fields: [
        {
          name: 'scopes',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Read Courses', value: 'courses:read' },
            { label: 'Write Courses', value: 'courses:write' },
            { label: 'Read Users', value: 'users:read' },
            { label: 'Write Users', value: 'users:write' },
            { label: 'Read Enrollments', value: 'enrollments:read' },
            { label: 'Write Enrollments', value: 'enrollments:write' },
            { label: 'Read Progress', value: 'progress:read' },
            { label: 'Write Progress', value: 'progress:write' },
            { label: 'Read Analytics', value: 'analytics:read' },
            { label: 'Webhooks', value: 'webhooks:manage' },
            { label: 'Full Access', value: 'admin' },
          ],
        },
        {
          name: 'ipWhitelist',
          type: 'array',
          admin: { description: 'Allowed IP addresses (empty = all)' },
          fields: [
            { name: 'ip', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'rateLimit',
      type: 'group',
      fields: [
        {
          name: 'requestsPerMinute',
          type: 'number',
          defaultValue: 60,
        },
        {
          name: 'requestsPerDay',
          type: 'number',
          defaultValue: 10000,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
        { label: 'Expired', value: 'expired' },
      ],
      index: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: { description: 'Key expiration date (null = never)' },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
    },
    {
      name: 'usage',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          name: 'totalRequests',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'requestsToday',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'lastResetAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'revokedAt',
      type: 'date',
    },
    {
      name: 'revokedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'revokeReason',
      type: 'textarea',
    },
  ],
  timestamps: true,
};

import type { CollectionConfig } from 'payload';

export const XAPIConfig: CollectionConfig = {
  slug: 'xapi-config',
  admin: {
    useAsTitle: 'name',
    group: 'Integrations',
    description: 'xAPI LRS (Learning Record Store) configuration',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { tenant: { equals: user.tenant } };
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
      admin: { description: 'Configuration name (e.g., "Production LRS")' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'endpoint',
      type: 'text',
      required: true,
      admin: { description: 'LRS endpoint URL (e.g., https://lrs.example.com/xapi/)' },
    },
    {
      name: 'authType',
      type: 'select',
      required: true,
      defaultValue: 'basic',
      options: [
        { label: 'Basic Auth', value: 'basic' },
        { label: 'OAuth 2.0', value: 'oauth2' },
        { label: 'API Key', value: 'api-key' },
      ],
    },
    {
      name: 'credentials',
      type: 'group',
      admin: { description: 'Authentication credentials (stored encrypted)' },
      fields: [
        {
          name: 'username',
          type: 'text',
          admin: { condition: (data) => data.authType === 'basic' },
        },
        {
          name: 'password',
          type: 'text',
          admin: { condition: (data) => data.authType === 'basic' },
        },
        {
          name: 'clientId',
          type: 'text',
          admin: { condition: (data) => data.authType === 'oauth2' },
        },
        {
          name: 'clientSecret',
          type: 'text',
          admin: { condition: (data) => data.authType === 'oauth2' },
        },
        {
          name: 'tokenUrl',
          type: 'text',
          admin: { condition: (data) => data.authType === 'oauth2' },
        },
        {
          name: 'apiKey',
          type: 'text',
          admin: { condition: (data) => data.authType === 'api-key' },
        },
      ],
    },
    {
      name: 'actorFormat',
      type: 'group',
      admin: { description: 'How to identify learners in statements' },
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'mbox',
          options: [
            { label: 'Email (mbox)', value: 'mbox' },
            { label: 'Account', value: 'account' },
            { label: 'OpenID', value: 'openid' },
          ],
        },
        {
          name: 'accountHomePage',
          type: 'text',
          admin: {
            description: 'Home page for account identifier',
            condition: (data) => data.actorFormat?.type === 'account',
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'batchSize',
          type: 'number',
          defaultValue: 50,
          admin: { description: 'Statements to send per batch' },
        },
        {
          name: 'sendInterval',
          type: 'number',
          defaultValue: 30,
          admin: { description: 'Seconds between batch sends' },
        },
        {
          name: 'retryAttempts',
          type: 'number',
          defaultValue: 3,
        },
        {
          name: 'includeContext',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Include course/lesson context in statements' },
        },
        {
          name: 'trackVoided',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Track voided statements' },
        },
      ],
    },
    {
      name: 'contextExtensions',
      type: 'array',
      admin: { description: 'Custom context extensions to include in all statements' },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          admin: { description: 'Extension IRI' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Error', value: 'error' },
      ],
      index: true,
    },
    {
      name: 'lastSyncAt',
      type: 'date',
    },
    {
      name: 'lastError',
      type: 'textarea',
    },
    {
      name: 'stats',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          name: 'statementsSent',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'statementsQueued',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'statementsFailed',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
  ],
  timestamps: true,
};

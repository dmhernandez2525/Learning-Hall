import type { CollectionConfig } from 'payload';

const SSOConfigs: CollectionConfig = {
  slug: 'sso-configs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'provider', 'isEnabled', 'organization'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'SAML', value: 'saml' },
        { label: 'OIDC', value: 'oidc' },
      ],
    },
    { name: 'name', type: 'text', required: true, maxLength: 200 },
    { name: 'issuerUrl', type: 'text', required: true },
    { name: 'clientId', type: 'text', required: true },
    { name: 'clientSecret', type: 'text', admin: { readOnly: false } },
    { name: 'metadataUrl', type: 'text' },
    { name: 'redirectUrl', type: 'text', required: true },
    { name: 'isEnabled', type: 'checkbox', defaultValue: false },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (!data.tenant && req.user.tenant) data.tenant = req.user.tenant;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default SSOConfigs;

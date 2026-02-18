import type { CollectionConfig } from 'payload';

const CustomUserFields: CollectionConfig = {
  slug: 'custom-user-fields',
  admin: {
    useAsTitle: 'fieldName',
    defaultColumns: ['fieldName', 'fieldType', 'isRequired', 'organization'],
    group: 'Enterprise',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
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
    { name: 'fieldName', type: 'text', required: true, maxLength: 100 },
    {
      name: 'fieldType',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Number', value: 'number' },
        { label: 'Date', value: 'date' },
        { label: 'Select', value: 'select' },
        { label: 'Boolean', value: 'boolean' },
      ],
    },
    { name: 'options', type: 'json', defaultValue: [] },
    { name: 'isRequired', type: 'checkbox', defaultValue: false },
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

export default CustomUserFields;

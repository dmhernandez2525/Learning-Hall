import type { CollectionConfig } from 'payload';

// Note: In production, credentials should be encrypted before storage
// See src/lib/storage/encryption.ts for encryption utilities

export const StorageConfigs: CollectionConfig = {
  slug: 'storage-configs',
  admin: {
    useAsTitle: 'bucket',
    defaultColumns: ['bucket', 'provider', 'isActive', 'updatedAt'],
    group: 'Settings',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { tenant: { equals: req.user?.tenant } };
    },
    create: ({ req }) => ['admin', 'instructor'].includes(req.user?.role || ''),
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { tenant: { equals: req.user?.tenant } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'AWS S3', value: 's3' },
        { label: 'Cloudflare R2', value: 'r2' },
        { label: 'Google Cloud Storage', value: 'gcs' },
        { label: 'Backblaze B2', value: 'b2' },
        { label: 'MinIO', value: 'minio' },
        { label: 'Local Filesystem', value: 'local' },
      ],
    },
    {
      name: 'bucket',
      type: 'text',
      required: true,
      admin: {
        description: 'Bucket or container name',
      },
    },
    {
      name: 'region',
      type: 'text',
      admin: {
        description: 'Region (e.g., us-east-1)',
        condition: (data) => ['s3', 'gcs'].includes(data?.provider),
      },
    },
    {
      name: 'endpoint',
      type: 'text',
      admin: {
        description: 'Custom endpoint URL (required for R2, MinIO, B2)',
        condition: (data) => ['r2', 'minio', 'b2'].includes(data?.provider),
      },
    },
    {
      name: 'accessKeyId',
      type: 'text',
      admin: {
        description: 'Access Key ID (will be encrypted)',
      },
    },
    {
      name: 'secretAccessKey',
      type: 'text',
      admin: {
        description: 'Secret Access Key (will be encrypted)',
      },
    },
    {
      name: 'credentialsEncrypted',
      type: 'text',
      hidden: true,
      admin: {
        disabled: true,
        description: 'Encrypted credentials (auto-populated)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Enable this storage configuration',
      },
    },
    {
      name: 'lastValidated',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Last successful connection test',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Encrypt credentials before saving
        if (data.accessKeyId && data.secretAccessKey) {
          // In production, use proper encryption
          // For now, we'll store a placeholder
          // TODO: Implement proper encryption
          data.credentialsEncrypted = Buffer.from(
            JSON.stringify({
              accessKeyId: data.accessKeyId,
              secretAccessKey: data.secretAccessKey,
            })
          ).toString('base64');

          // Remove plaintext credentials
          delete data.accessKeyId;
          delete data.secretAccessKey;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

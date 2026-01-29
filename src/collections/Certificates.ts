import type { CollectionConfig } from 'payload';
import { v4 as uuidv4 } from 'uuid';

const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'certificateId',
    defaultColumns: ['certificateId', 'user', 'course', 'completionDate', 'createdAt'],
    group: 'Content',
    description: 'Course completion certificates',
  },
  access: {
    read: ({ req: { user } }) => {
      // Allow public read for verification (certificateId lookup)
      // But filter by user for listing their own certificates
      if (!user) return true; // Allow public verification
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: ({ req: { user } }) => {
      // Allow system to create (via hooks) or admin
      return user?.role === 'admin' || user?.role === 'instructor' || Boolean(user);
    },
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'certificateId',
      type: 'text',
      unique: true,
      index: true,
      defaultValue: () => uuidv4(),
      admin: {
        readOnly: true,
        description: 'Unique verification ID for this certificate',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      hasMany: false,
    },
    {
      name: 'completionDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    // Template customization fields
    {
      name: 'template',
      type: 'group',
      admin: {
        description: 'Certificate template settings (inherited from course if not set)',
      },
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'classic',
          options: [
            { label: 'Classic', value: 'classic' },
            { label: 'Modern', value: 'modern' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Professional', value: 'professional' },
            { label: 'Elegant', value: 'elegant' },
          ],
        },
        {
          name: 'primaryColor',
          type: 'text',
          admin: {
            description: 'Primary color (hex code, e.g., #1a365d)',
          },
        },
        {
          name: 'accentColor',
          type: 'text',
          admin: {
            description: 'Accent color (hex code, e.g., #e2e8f0)',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Custom logo for the certificate',
          },
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Background image for the certificate',
          },
        },
        {
          name: 'signatureName',
          type: 'text',
          admin: {
            description: 'Name to display as signature',
          },
        },
        {
          name: 'signatureTitle',
          type: 'text',
          admin: {
            description: 'Title under signature (e.g., "Course Instructor")',
          },
        },
        {
          name: 'signatureImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Signature image',
          },
        },
        {
          name: 'additionalText',
          type: 'textarea',
          admin: {
            description: 'Additional text to display on certificate',
          },
        },
      ],
    },
    // Sharing and verification
    {
      name: 'shareCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this certificate has been shared',
      },
    },
    {
      name: 'verificationCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this certificate has been verified',
      },
    },
    {
      name: 'downloadCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this certificate has been downloaded',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Allow this certificate to be publicly verified',
      },
    },
  ],
  timestamps: true,
};

export default Certificates;

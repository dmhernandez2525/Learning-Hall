import type { CollectionConfig } from 'payload';
import { sendWelcomeEmail } from '../lib/email';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'createdAt'],
    group: 'Admin',
  },
  access: {
    read: ({ req }) => {
      // Users can read their own data, admins can read all
      if (req.user?.role === 'admin') return true;
      return { id: { equals: req.user?.id } };
    },
    create: () => true, // Anyone can register
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { id: { equals: req.user?.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Student', value: 'student' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 500,
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        description: 'User preferences',
      },
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          label: 'Receive email notifications',
        },
        {
          name: 'marketingEmails',
          type: 'checkbox',
          defaultValue: false,
          label: 'Receive marketing emails',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Send welcome email on user registration
        if (operation === 'create' && doc.email) {
          try {
            await sendWelcomeEmail(doc.email, {
              userName: doc.name || 'there',
            });
            console.log(`[Users] Welcome email sent to ${doc.email}`);
          } catch (error) {
            // Don't fail registration if email fails
            console.error(`[Users] Failed to send welcome email to ${doc.email}:`, error);
          }
        }
      },
    ],
  },
  timestamps: true,
};

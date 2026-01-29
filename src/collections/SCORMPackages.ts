import type { CollectionConfig } from 'payload';

export const SCORMPackages: CollectionConfig = {
  slug: 'scorm-packages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'SCORM and xAPI content packages',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { tenant: { equals: user.tenant } };
    },
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      index: true,
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
    },
    {
      name: 'packageFile',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Upload SCORM/xAPI package (.zip)' },
    },
    {
      name: 'version',
      type: 'select',
      required: true,
      options: [
        { label: 'SCORM 1.2', value: 'scorm-1.2' },
        { label: 'SCORM 2004 3rd Edition', value: 'scorm-2004-3rd' },
        { label: 'SCORM 2004 4th Edition', value: 'scorm-2004-4th' },
        { label: 'xAPI (Tin Can)', value: 'xapi' },
        { label: 'cmi5', value: 'cmi5' },
      ],
    },
    {
      name: 'launchUrl',
      type: 'text',
      admin: { description: 'Relative path to launch file within package' },
    },
    {
      name: 'manifestData',
      type: 'json',
      admin: { description: 'Parsed manifest/metadata from package' },
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'fullScreen',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'width',
          type: 'number',
          defaultValue: 1024,
        },
        {
          name: 'height',
          type: 'number',
          defaultValue: 768,
        },
        {
          name: 'exitBehavior',
          type: 'select',
          defaultValue: 'close',
          options: [
            { label: 'Close Window', value: 'close' },
            { label: 'Redirect to Course', value: 'redirect' },
            { label: 'Show Completion', value: 'completion' },
          ],
        },
        {
          name: 'timeLimit',
          type: 'number',
          admin: { description: 'Time limit in minutes (0 = unlimited)' },
        },
        {
          name: 'masteryScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: { description: 'Minimum passing score' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'processing',
      options: [
        { label: 'Processing', value: 'processing' },
        { label: 'Active', value: 'active' },
        { label: 'Error', value: 'error' },
        { label: 'Archived', value: 'archived' },
      ],
      index: true,
    },
    {
      name: 'processingError',
      type: 'textarea',
      admin: { condition: (data) => data.status === 'error' },
    },
    {
      name: 'extractedPath',
      type: 'text',
      admin: { description: 'Path where package was extracted' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
  timestamps: true,
};

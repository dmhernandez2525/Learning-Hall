import type { CollectionConfig, Where } from 'payload';

export const LiveSessions: CollectionConfig = {
  slug: 'live-sessions',
  admin: {
    useAsTitle: 'title',
    group: 'Live Learning',
    description: 'Live webinars and sessions',
    defaultColumns: ['title', 'course', 'scheduledAt', 'status', 'platform'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { status: { equals: 'published' } } as Where;
      if (user.role === 'admin') return true;
      if (user.role === 'instructor') {
        return {
          or: [
            { host: { equals: user.id } },
            { status: { equals: 'published' } },
          ],
        } as Where;
      }
      return { status: { equals: 'published' } } as Where;
    },
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'instructor',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      if (user?.role === 'instructor') {
        return { host: { equals: user.id } };
      }
      return false;
    },
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
      type: 'richText',
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      admin: { description: 'Associated course (optional)' },
    },
    {
      name: 'host',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'coHosts',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
        { label: 'Live', value: 'live' },
        { label: 'Ended', value: 'ended' },
        { label: 'Canceled', value: 'canceled' },
      ],
      index: true,
    },
    {
      name: 'scheduling',
      type: 'group',
      fields: [
        {
          name: 'scheduledAt',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'duration',
          type: 'number',
          required: true,
          defaultValue: 60,
          admin: { description: 'Duration in minutes' },
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'America/New_York',
        },
        {
          name: 'actualStartedAt',
          type: 'date',
        },
        {
          name: 'actualEndedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'platform',
      type: 'group',
      fields: [
        {
          name: 'provider',
          type: 'select',
          required: true,
          options: [
            { label: 'Zoom', value: 'zoom' },
            { label: 'Google Meet', value: 'google_meet' },
            { label: 'Microsoft Teams', value: 'teams' },
            { label: 'Custom RTMP', value: 'rtmp' },
            { label: 'YouTube Live', value: 'youtube' },
            { label: 'Twitch', value: 'twitch' },
            { label: 'Internal', value: 'internal' },
          ],
        },
        {
          name: 'meetingId',
          type: 'text',
          admin: { description: 'External meeting ID' },
        },
        {
          name: 'password',
          type: 'text',
          admin: { description: 'Meeting password (if any)' },
        },
        {
          name: 'joinUrl',
          type: 'text',
          admin: { description: 'URL for participants to join' },
        },
        {
          name: 'hostUrl',
          type: 'text',
          admin: { description: 'URL for host to start' },
        },
        {
          name: 'rtmpUrl',
          type: 'text',
          admin: {
            description: 'RTMP stream URL',
            condition: (data, siblingData) => siblingData?.provider === 'rtmp',
          },
        },
        {
          name: 'rtmpKey',
          type: 'text',
          admin: {
            description: 'RTMP stream key',
            condition: (data, siblingData) => siblingData?.provider === 'rtmp',
          },
        },
        {
          name: 'embedCode',
          type: 'textarea',
          admin: { description: 'Custom embed code for streaming' },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'maxAttendees',
          type: 'number',
          admin: { description: 'Maximum participants (null = unlimited)' },
        },
        {
          name: 'requiresEnrollment',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Must be enrolled in course to join' },
        },
        {
          name: 'requiresRegistration',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Must register in advance' },
        },
        {
          name: 'enableChat',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableQA',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enablePolls',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'enableHandRaise',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableRecording',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'autoRecord',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'waitingRoom',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'muteOnEntry',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'recording',
      type: 'group',
      admin: { description: 'Recording details (after session ends)' },
      fields: [
        {
          name: 'available',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'duration',
          type: 'number',
          admin: { description: 'Recording duration in seconds' },
        },
        {
          name: 'size',
          type: 'number',
          admin: { description: 'File size in bytes' },
        },
        {
          name: 'expiresAt',
          type: 'date',
        },
        {
          name: 'downloadUrl',
          type: 'text',
        },
        {
          name: 'transcriptUrl',
          type: 'text',
        },
      ],
    },
    {
      name: 'materials',
      type: 'array',
      admin: { description: 'Session materials and resources' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Slides', value: 'slides' },
            { label: 'Document', value: 'document' },
            { label: 'Link', value: 'link' },
            { label: 'Video', value: 'video' },
          ],
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'availableAfterSession',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'reminders',
      type: 'group',
      fields: [
        {
          name: 'sendEmail24h',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'sendEmail1h',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'sendEmail15m',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'customMessage',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          name: 'registrations',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'attendees',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'peakAttendees',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'averageDuration',
          type: 'number',
          admin: { description: 'Average watch time in minutes' },
        },
        {
          name: 'chatMessages',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'questions',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Session thumbnail/banner' },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
};

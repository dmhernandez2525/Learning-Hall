

import type { CollectionConfig } from 'payload';

export const SessionAttendance: CollectionConfig = {
  slug: 'session-attendance',
  admin: {
    useAsTitle: 'id',
    group: 'Live Learning',
    description: 'Attendance records for live sessions',
    defaultColumns: ['session', 'user', 'status', 'joinedAt', 'duration'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: () => false,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'session',
      type: 'relationship',
      relationTo: 'live-sessions',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'registered',
      options: [
        { label: 'Registered', value: 'registered' },
        { label: 'Joined', value: 'joined' },
        { label: 'Left Early', value: 'left_early' },
        { label: 'Completed', value: 'completed' },
        { label: 'No Show', value: 'no_show' },
      ],
      index: true,
    },
    {
      name: 'registeredAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'joinedAt',
      type: 'date',
    },
    {
      name: 'leftAt',
      type: 'date',
    },
    {
      name: 'duration',
      type: 'number',
      admin: { description: 'Total watch time in seconds' },
    },
    {
      name: 'attendance',
      type: 'array',
      admin: { description: 'Join/leave events' },
      fields: [
        {
          name: 'event',
          type: 'select',
          options: [
            { label: 'Joined', value: 'joined' },
            { label: 'Left', value: 'left' },
            { label: 'Reconnected', value: 'reconnected' },
          ],
        },
        {
          name: 'timestamp',
          type: 'date',
        },
      ],
    },
    {
      name: 'engagement',
      type: 'group',
      fields: [
        {
          name: 'chatMessages',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'questionsAsked',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'pollsAnswered',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'handRaises',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'reactions',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'device',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Tablet', value: 'tablet' },
          ],
        },
        {
          name: 'browser',
          type: 'text',
        },
        {
          name: 'os',
          type: 'text',
        },
        {
          name: 'ipAddress',
          type: 'text',
        },
      ],
    },
    {
      name: 'feedback',
      type: 'group',
      admin: { description: 'Post-session feedback' },
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
        },
        {
          name: 'comment',
          type: 'textarea',
        },
        {
          name: 'submittedAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'certificate',
      type: 'group',
      admin: { description: 'Attendance certificate' },
      fields: [
        {
          name: 'issued',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'issuedAt',
          type: 'date',
        },
        {
          name: 'certificateId',
          type: 'text',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal notes' },
    },
  ],
  timestamps: true,
};

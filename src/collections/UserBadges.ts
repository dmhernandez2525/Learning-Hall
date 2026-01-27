

import type { CollectionConfig } from 'payload';

export const UserBadges: CollectionConfig = {
  slug: 'user-badges',
  admin: {
    useAsTitle: 'id',
    group: 'Gamification',
    description: 'Badges earned by users',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'badge',
      type: 'relationship',
      relationTo: 'badges',
      required: true,
      index: true,
    },
    {
      name: 'awardedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'progress',
      type: 'group',
      admin: {
        description: 'Progress tracking for badges with thresholds',
      },
      fields: [
        {
          name: 'current',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Current progress value',
          },
        },
        {
          name: 'required',
          type: 'number',
          admin: {
            description: 'Required value to earn (copied from badge criteria)',
          },
        },
        {
          name: 'isComplete',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'earnedFrom',
      type: 'group',
      admin: {
        description: 'Context of how the badge was earned',
      },
      fields: [
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          admin: {
            description: 'Course that triggered this badge',
          },
        },
        {
          name: 'lesson',
          type: 'relationship',
          relationTo: 'lessons',
          admin: {
            description: 'Lesson that triggered this badge',
          },
        },
        {
          name: 'quiz',
          type: 'relationship',
          relationTo: 'quizzes',
          admin: {
            description: 'Quiz that triggered this badge',
          },
        },
      ],
    },
    {
      name: 'notified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether user has been notified of this badge',
      },
    },
    {
      name: 'displayedAt',
      type: 'date',
      admin: {
        description: 'When the user first viewed this badge',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.progress?.current && data?.progress?.required) {
          data.progress.isComplete = data.progress.current >= data.progress.required;
        }
        return data;
      },
    ],
  },
};

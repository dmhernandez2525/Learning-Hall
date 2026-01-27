'use client';

import type { CollectionConfig } from 'payload';

export const UserPoints: CollectionConfig = {
  slug: 'user-points',
  admin: {
    useAsTitle: 'id',
    group: 'Gamification',
    description: 'User XP, levels, and streaks',
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
      unique: true,
      index: true,
    },
    {
      name: 'totalPoints',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Total XP earned',
      },
    },
    {
      name: 'level',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: {
        description: 'Current level (calculated from totalPoints)',
      },
    },
    {
      name: 'pointsToNextLevel',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: {
        description: 'Points needed to reach next level',
      },
    },
    {
      name: 'streak',
      type: 'group',
      fields: [
        {
          name: 'current',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Current daily learning streak',
          },
        },
        {
          name: 'longest',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Longest streak achieved',
          },
        },
        {
          name: 'lastActivityDate',
          type: 'date',
          admin: {
            description: 'Date of last qualifying activity',
          },
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        {
          name: 'coursesCompleted',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'lessonsCompleted',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'quizzesPassed',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'perfectQuizzes',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'certificatesEarned',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'discussionPosts',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'reviewsWritten',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'helpfulVotesReceived',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'badgesEarned',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
      ],
    },
    {
      name: 'pointsHistory',
      type: 'array',
      admin: {
        description: 'Recent points transactions',
      },
      maxRows: 100,
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
        {
          name: 'source',
          type: 'select',
          required: true,
          options: [
            { label: 'Lesson Completed', value: 'lesson' },
            { label: 'Course Completed', value: 'course' },
            { label: 'Quiz Passed', value: 'quiz' },
            { label: 'Quiz Perfect', value: 'quiz_perfect' },
            { label: 'Badge Earned', value: 'badge' },
            { label: 'Streak Bonus', value: 'streak' },
            { label: 'Review Written', value: 'review' },
            { label: 'Discussion Post', value: 'discussion' },
            { label: 'Daily Login', value: 'login' },
            { label: 'Admin Adjustment', value: 'admin' },
          ],
        },
        {
          name: 'earnedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'relatedId',
          type: 'text',
          admin: {
            description: 'ID of related item (lesson, course, badge, etc.)',
          },
        },
      ],
    },
    {
      name: 'rank',
      type: 'number',
      admin: {
        description: 'Leaderboard rank (updated periodically)',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Display title based on level',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.totalPoints !== undefined) {
          // Level calculation: Level = floor(sqrt(totalPoints / 100)) + 1
          // Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
          const level = Math.floor(Math.sqrt(data.totalPoints / 100)) + 1;
          data.level = level;

          // Points needed for next level
          const nextLevelPoints = Math.pow(level, 2) * 100;
          data.pointsToNextLevel = nextLevelPoints - data.totalPoints;

          // Update title based on level
          const titles = [
            { min: 1, title: 'Novice' },
            { min: 5, title: 'Apprentice' },
            { min: 10, title: 'Student' },
            { min: 15, title: 'Scholar' },
            { min: 20, title: 'Expert' },
            { min: 30, title: 'Master' },
            { min: 50, title: 'Grandmaster' },
            { min: 75, title: 'Legend' },
            { min: 100, title: 'Sage' },
          ];
          const titleEntry = [...titles].reverse().find((t) => level >= t.min);
          data.title = titleEntry?.title || 'Novice';
        }

        // Update longest streak if current exceeds it
        if (data?.streak?.current && data?.streak?.longest !== undefined) {
          if (data.streak.current > data.streak.longest) {
            data.streak.longest = data.streak.current;
          }
        }

        return data;
      },
    ],
  },
};

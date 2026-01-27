

import type { CollectionConfig } from 'payload';

export const Badges: CollectionConfig = {
  slug: 'badges',
  admin: {
    useAsTitle: 'name',
    group: 'Gamification',
    description: 'Achievement badges that users can earn',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the badge (e.g., "first-course", "streak-7")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'rarity',
      type: 'select',
      required: true,
      defaultValue: 'common',
      options: [
        { label: 'Common', value: 'common' },
        { label: 'Uncommon', value: 'uncommon' },
        { label: 'Rare', value: 'rare' },
        { label: 'Epic', value: 'epic' },
        { label: 'Legendary', value: 'legendary' },
      ],
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 10,
      admin: {
        description: 'XP points awarded when badge is earned',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Course Completion', value: 'course' },
        { label: 'Learning Streak', value: 'streak' },
        { label: 'Quiz Performance', value: 'quiz' },
        { label: 'Community', value: 'community' },
        { label: 'Milestone', value: 'milestone' },
        { label: 'Special', value: 'special' },
      ],
    },
    {
      name: 'criteria',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Course Completed', value: 'course_completed' },
            { label: 'Courses Completed Count', value: 'courses_completed_count' },
            { label: 'Lesson Completed', value: 'lesson_completed' },
            { label: 'Lessons Completed Count', value: 'lessons_completed_count' },
            { label: 'Quiz Passed', value: 'quiz_passed' },
            { label: 'Quiz Perfect Score', value: 'quiz_perfect' },
            { label: 'Quizzes Passed Count', value: 'quizzes_passed_count' },
            { label: 'Certificate Earned', value: 'certificate_earned' },
            { label: 'Certificates Count', value: 'certificates_count' },
            { label: 'Daily Streak', value: 'daily_streak' },
            { label: 'Discussion Posts', value: 'discussion_posts' },
            { label: 'Helpful Reviews', value: 'helpful_reviews' },
            { label: 'First Action', value: 'first_action' },
            { label: 'Manual Award', value: 'manual' },
          ],
        },
        {
          name: 'threshold',
          type: 'number',
          admin: {
            description: 'Required count/value to earn badge (e.g., 5 for "Complete 5 courses")',
            condition: (data, siblingData) =>
              siblingData?.type && !['first_action', 'manual'].includes(siblingData.type),
          },
        },
        {
          name: 'specificCourse',
          type: 'relationship',
          relationTo: 'courses',
          admin: {
            description: 'Specific course required (optional)',
            condition: (data, siblingData) =>
              siblingData?.type && ['course_completed', 'lesson_completed'].includes(siblingData.type),
          },
        },
        {
          name: 'actionType',
          type: 'select',
          options: [
            { label: 'First Course Enrolled', value: 'first_enrollment' },
            { label: 'First Lesson Completed', value: 'first_lesson' },
            { label: 'First Quiz Passed', value: 'first_quiz' },
            { label: 'First Certificate', value: 'first_certificate' },
            { label: 'First Review', value: 'first_review' },
            { label: 'First Discussion Post', value: 'first_post' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'first_action',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this badge can currently be earned',
      },
    },
    {
      name: 'isSecret',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hidden badge - not shown until earned',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in badge display (lower = first)',
      },
    },
  ],
};

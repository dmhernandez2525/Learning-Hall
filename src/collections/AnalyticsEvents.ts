import type { CollectionConfig } from 'payload';

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  admin: {
    useAsTitle: 'eventType',
    group: 'Analytics',
    description: 'Track user interactions and engagement',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { tenant: { equals: user.tenant } };
    },
    create: () => true, // Allow system to create events
    update: () => false, // Events are immutable
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        // Page views
        { label: 'Page View', value: 'page.view' },
        { label: 'Course View', value: 'course.view' },
        { label: 'Lesson View', value: 'lesson.view' },
        // Engagement
        { label: 'Video Play', value: 'video.play' },
        { label: 'Video Pause', value: 'video.pause' },
        { label: 'Video Complete', value: 'video.complete' },
        { label: 'Video Seek', value: 'video.seek' },
        // Learning
        { label: 'Lesson Start', value: 'lesson.start' },
        { label: 'Lesson Complete', value: 'lesson.complete' },
        { label: 'Quiz Start', value: 'quiz.start' },
        { label: 'Quiz Submit', value: 'quiz.submit' },
        { label: 'Quiz Complete', value: 'quiz.complete' },
        // Social
        { label: 'Discussion Post', value: 'discussion.post' },
        { label: 'Discussion Reply', value: 'discussion.reply' },
        { label: 'Note Create', value: 'note.create' },
        { label: 'Bookmark Add', value: 'bookmark.add' },
        // Commerce
        { label: 'Checkout Start', value: 'checkout.start' },
        { label: 'Checkout Complete', value: 'checkout.complete' },
        { label: 'Checkout Abandon', value: 'checkout.abandon' },
        // System
        { label: 'Login', value: 'auth.login' },
        { label: 'Logout', value: 'auth.logout' },
        { label: 'Registration', value: 'auth.register' },
        { label: 'Search', value: 'search.query' },
        { label: 'Error', value: 'error.occurred' },
      ],
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
    },
    {
      name: 'sessionId',
      type: 'text',
      admin: { description: 'Browser session identifier' },
      index: true,
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
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
    },
    {
      name: 'metadata',
      type: 'json',
      admin: { description: 'Additional event-specific data' },
    },
    {
      name: 'properties',
      type: 'group',
      fields: [
        {
          name: 'duration',
          type: 'number',
          admin: { description: 'Duration in seconds (for timed events)' },
        },
        {
          name: 'progress',
          type: 'number',
          min: 0,
          max: 100,
          admin: { description: 'Progress percentage' },
        },
        {
          name: 'score',
          type: 'number',
          admin: { description: 'Score (for quiz events)' },
        },
        {
          name: 'value',
          type: 'number',
          admin: { description: 'Monetary value (for commerce events)' },
        },
        {
          name: 'query',
          type: 'text',
          admin: { description: 'Search query (for search events)' },
        },
        {
          name: 'errorMessage',
          type: 'text',
          admin: { description: 'Error message (for error events)' },
        },
      ],
    },
    {
      name: 'context',
      type: 'group',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'referrer',
          type: 'text',
        },
        {
          name: 'userAgent',
          type: 'text',
        },
        {
          name: 'ip',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
        },
        {
          name: 'device',
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
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      index: true,
    },
  ],
  timestamps: true,
};

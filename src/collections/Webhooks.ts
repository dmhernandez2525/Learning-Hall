import type { CollectionConfig } from 'payload';

export const Webhooks: CollectionConfig = {
  slug: 'webhooks',
  admin: {
    useAsTitle: 'name',
    group: 'Integrations',
    description: 'Webhook endpoints for event notifications',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { createdBy: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'A friendly name for this webhook',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'The URL to send webhook events to',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'secret',
      type: 'text',
      admin: {
        description: 'Secret key for signing webhook payloads',
        readOnly: true,
      },
    },
    {
      name: 'events',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        // User events
        { label: 'User Created', value: 'user.created' },
        { label: 'User Updated', value: 'user.updated' },
        { label: 'User Deleted', value: 'user.deleted' },
        // Course events
        { label: 'Course Created', value: 'course.created' },
        { label: 'Course Updated', value: 'course.updated' },
        { label: 'Course Published', value: 'course.published' },
        { label: 'Course Deleted', value: 'course.deleted' },
        // Enrollment events
        { label: 'Enrollment Created', value: 'enrollment.created' },
        { label: 'Enrollment Completed', value: 'enrollment.completed' },
        { label: 'Enrollment Progress', value: 'enrollment.progress' },
        // Lesson events
        { label: 'Lesson Completed', value: 'lesson.completed' },
        // Quiz events
        { label: 'Quiz Started', value: 'quiz.started' },
        { label: 'Quiz Completed', value: 'quiz.completed' },
        { label: 'Quiz Passed', value: 'quiz.passed' },
        { label: 'Quiz Failed', value: 'quiz.failed' },
        // Certificate events
        { label: 'Certificate Issued', value: 'certificate.issued' },
        // Payment events
        { label: 'Payment Created', value: 'payment.created' },
        { label: 'Payment Completed', value: 'payment.completed' },
        { label: 'Payment Failed', value: 'payment.failed' },
        { label: 'Refund Issued', value: 'payment.refunded' },
        // Subscription events
        { label: 'Subscription Created', value: 'subscription.created' },
        { label: 'Subscription Updated', value: 'subscription.updated' },
        { label: 'Subscription Cancelled', value: 'subscription.cancelled' },
        { label: 'Subscription Renewed', value: 'subscription.renewed' },
        // Review events
        { label: 'Review Created', value: 'review.created' },
        // Badge events
        { label: 'Badge Earned', value: 'badge.earned' },
      ],
      admin: {
        description: 'Events that will trigger this webhook',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Failed', value: 'failed' },
      ],
      index: true,
    },
    {
      name: 'headers',
      type: 'array',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Custom headers to include in webhook requests',
      },
    },
    {
      name: 'retryPolicy',
      type: 'group',
      fields: [
        {
          name: 'maxRetries',
          type: 'number',
          defaultValue: 3,
          min: 0,
          max: 10,
        },
        {
          name: 'retryDelay',
          type: 'number',
          defaultValue: 60,
          admin: {
            description: 'Delay between retries in seconds',
          },
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'deliveredCount',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'failedCount',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'lastDeliveredAt',
          type: 'date',
        },
        {
          name: 'lastFailedAt',
          type: 'date',
        },
        {
          name: 'lastError',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
};

export default Webhooks;

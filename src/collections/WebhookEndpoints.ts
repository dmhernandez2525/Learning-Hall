import type { CollectionConfig } from 'payload';

export const WebhookEndpoints: CollectionConfig = {
  slug: 'webhook-endpoints',
  admin: {
    useAsTitle: 'url',
    group: 'Integrations',
    description: 'Webhook endpoints for external notifications',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { tenant: { equals: user.tenant } };
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'Webhook endpoint URL (HTTPS required)' },
    },
    {
      name: 'description',
      type: 'textarea',
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
      required: true,
      admin: {
        description: 'Signing secret for webhook verification',
        readOnly: true,
      },
    },
    {
      name: 'events',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'All Events', value: '*' },
        { label: 'User Created', value: 'user.created' },
        { label: 'User Updated', value: 'user.updated' },
        { label: 'User Deleted', value: 'user.deleted' },
        { label: 'Course Created', value: 'course.created' },
        { label: 'Course Updated', value: 'course.updated' },
        { label: 'Course Published', value: 'course.published' },
        { label: 'Enrollment Created', value: 'enrollment.created' },
        { label: 'Enrollment Completed', value: 'enrollment.completed' },
        { label: 'Progress Updated', value: 'progress.updated' },
        { label: 'Lesson Completed', value: 'lesson.completed' },
        { label: 'Quiz Completed', value: 'quiz.completed' },
        { label: 'Certificate Issued', value: 'certificate.issued' },
        { label: 'Payment Succeeded', value: 'payment.succeeded' },
        { label: 'Payment Failed', value: 'payment.failed' },
        { label: 'Subscription Created', value: 'subscription.created' },
        { label: 'Subscription Canceled', value: 'subscription.canceled' },
        { label: 'Review Created', value: 'review.created' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
        { label: 'Failed', value: 'failed' },
      ],
      index: true,
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'retryOnFailure',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'maxRetries',
          type: 'number',
          defaultValue: 3,
        },
        {
          name: 'timeout',
          type: 'number',
          defaultValue: 30,
          admin: { description: 'Timeout in seconds' },
        },
        {
          name: 'headers',
          type: 'array',
          admin: { description: 'Custom headers to include' },
          fields: [
            { name: 'key', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        {
          name: 'totalDeliveries',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'successfulDeliveries',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'failedDeliveries',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'lastDeliveryAt',
          type: 'date',
        },
        {
          name: 'lastSuccessAt',
          type: 'date',
        },
        {
          name: 'lastFailureAt',
          type: 'date',
        },
        {
          name: 'consecutiveFailures',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'disabledAt',
      type: 'date',
    },
    {
      name: 'disabledReason',
      type: 'textarea',
    },
  ],
  timestamps: true,
};

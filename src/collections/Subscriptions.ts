

import type { CollectionConfig } from 'payload';

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    group: 'Business',
    description: 'User subscriptions',
    defaultColumns: ['user', 'plan', 'status', 'currentPeriodEnd'],
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
      name: 'plan',
      type: 'relationship',
      relationTo: 'subscription-plans',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Trialing', value: 'trialing' },
        { label: 'Active', value: 'active' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Incomplete Expired', value: 'incomplete_expired' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paused', value: 'paused' },
      ],
      index: true,
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      index: true,
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
      required: true,
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'trialStart',
      type: 'date',
    },
    {
      name: 'trialEnd',
      type: 'date',
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'canceledAt',
      type: 'date',
    },
    {
      name: 'cancelReason',
      type: 'select',
      options: [
        { label: 'Too Expensive', value: 'too_expensive' },
        { label: 'Not Using Enough', value: 'not_using' },
        { label: 'Missing Features', value: 'missing_features' },
        { label: 'Switching Provider', value: 'switching' },
        { label: 'Temporary Pause', value: 'temporary' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'cancelFeedback',
      type: 'textarea',
    },
    {
      name: 'usage',
      type: 'group',
      admin: {
        description: 'Current usage for this billing period',
      },
      fields: [
        {
          name: 'coursesEnrolled',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'downloadsUsed',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'aiQuestionsUsed',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'lastResetAt',
          type: 'date',
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
  ],
  timestamps: true,
};

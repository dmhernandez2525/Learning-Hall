

import type { CollectionConfig } from 'payload';

export const AffiliateReferrals: CollectionConfig = {
  slug: 'affiliate-referrals',
  admin: {
    useAsTitle: 'id',
    group: 'Affiliates',
    description: 'Tracked affiliate referrals and conversions',
    defaultColumns: ['affiliate', 'referredUser', 'status', 'commission', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Affiliates can only see their own referrals
      return { 'affiliate.user': { equals: user.id } };
    },
    create: () => false,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'affiliate',
      type: 'relationship',
      relationTo: 'affiliates',
      required: true,
      index: true,
    },
    {
      name: 'referredUser',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        description: 'User who was referred (if they signed up)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'clicked',
      options: [
        { label: 'Clicked', value: 'clicked' },
        { label: 'Signed Up', value: 'signed_up' },
        { label: 'Converted', value: 'converted' },
        { label: 'Paid', value: 'paid' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Disputed', value: 'disputed' },
      ],
      index: true,
    },
    {
      name: 'tracking',
      type: 'group',
      fields: [
        {
          name: 'referralCode',
          type: 'text',
          required: true,
          admin: {
            description: 'Affiliate code used',
          },
        },
        {
          name: 'customLink',
          type: 'text',
          admin: {
            description: 'Custom link slug if used',
          },
        },
        {
          name: 'landingPage',
          type: 'text',
          admin: {
            description: 'Page they landed on',
          },
        },
        {
          name: 'utmSource',
          type: 'text',
        },
        {
          name: 'utmMedium',
          type: 'text',
        },
        {
          name: 'utmCampaign',
          type: 'text',
        },
        {
          name: 'ipAddress',
          type: 'text',
        },
        {
          name: 'userAgent',
          type: 'textarea',
        },
        {
          name: 'referrer',
          type: 'text',
        },
      ],
    },
    {
      name: 'payment',
      type: 'relationship',
      relationTo: 'payments',
      admin: {
        description: 'Associated payment (when converted)',
      },
    },
    {
      name: 'purchase',
      type: 'group',
      admin: {
        condition: (data) => data?.status === 'converted' || data?.status === 'paid',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Course', value: 'course' },
            { label: 'Bundle', value: 'bundle' },
            { label: 'Subscription', value: 'subscription' },
          ],
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
        },
        {
          name: 'bundle',
          type: 'relationship',
          relationTo: 'course-bundles',
        },
        {
          name: 'subscriptionPlan',
          type: 'relationship',
          relationTo: 'subscription-plans',
        },
        {
          name: 'amount',
          type: 'number',
          admin: {
            description: 'Purchase amount in cents',
          },
        },
      ],
    },
    {
      name: 'commission',
      type: 'group',
      fields: [
        {
          name: 'rate',
          type: 'number',
          admin: {
            description: 'Commission rate at time of conversion',
          },
        },
        {
          name: 'amount',
          type: 'number',
          admin: {
            description: 'Commission amount in cents',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Cleared', value: 'cleared' },
            { label: 'Paid', value: 'paid' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Rejected', value: 'rejected' },
          ],
        },
        {
          name: 'clearsAt',
          type: 'date',
          admin: {
            description: 'When commission becomes available (after hold period)',
          },
        },
        {
          name: 'paidAt',
          type: 'date',
        },
        {
          name: 'payout',
          type: 'relationship',
          relationTo: 'affiliate-payouts',
          admin: {
            description: 'Payout this commission was included in',
          },
        },
      ],
    },
    {
      name: 'subscriptionTracking',
      type: 'group',
      admin: {
        description: 'For recurring subscription commissions',
        condition: (data) => data?.purchase?.type === 'subscription',
      },
      fields: [
        {
          name: 'subscription',
          type: 'relationship',
          relationTo: 'subscriptions',
        },
        {
          name: 'monthsRemaining',
          type: 'number',
          admin: {
            description: 'Remaining months of recurring commission',
          },
        },
        {
          name: 'nextCommissionAt',
          type: 'date',
        },
        {
          name: 'totalRecurringEarned',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total recurring commissions earned (cents)',
          },
        },
      ],
    },
    {
      name: 'clickedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'signedUpAt',
      type: 'date',
    },
    {
      name: 'convertedAt',
      type: 'date',
    },
    {
      name: 'cookieExpiresAt',
      type: 'date',
      admin: {
        description: 'When the attribution cookie expires',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
};

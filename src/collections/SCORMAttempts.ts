import type { CollectionConfig } from 'payload';

export const SCORMAttempts: CollectionConfig = {
  slug: 'scorm-attempts',
  admin: {
    useAsTitle: 'id',
    group: 'Content',
    description: 'SCORM/xAPI learning attempts and progress',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { user: { equals: user?.id } };
    },
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
      name: 'package',
      type: 'relationship',
      relationTo: 'scorm-packages',
      required: true,
      index: true,
    },
    {
      name: 'attemptNumber',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'not-attempted',
      options: [
        { label: 'Not Attempted', value: 'not-attempted' },
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Completed', value: 'completed' },
        { label: 'Passed', value: 'passed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Browsed', value: 'browsed' },
      ],
      index: true,
    },
    {
      name: 'successStatus',
      type: 'select',
      options: [
        { label: 'Unknown', value: 'unknown' },
        { label: 'Passed', value: 'passed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'score',
      type: 'group',
      fields: [
        {
          name: 'raw',
          type: 'number',
          admin: { description: 'Raw score' },
        },
        {
          name: 'min',
          type: 'number',
          admin: { description: 'Minimum possible score' },
        },
        {
          name: 'max',
          type: 'number',
          admin: { description: 'Maximum possible score' },
        },
        {
          name: 'scaled',
          type: 'number',
          min: -1,
          max: 1,
          admin: { description: 'Scaled score (-1 to 1)' },
        },
      ],
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Progress percentage' },
    },
    {
      name: 'totalTime',
      type: 'text',
      admin: { description: 'Total session time (ISO 8601 duration)' },
    },
    {
      name: 'totalTimeSeconds',
      type: 'number',
      admin: { description: 'Total time in seconds' },
    },
    {
      name: 'suspendData',
      type: 'textarea',
      admin: { description: 'SCORM suspend data for resuming' },
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'Last location/bookmark in content' },
    },
    {
      name: 'cmiData',
      type: 'json',
      admin: { description: 'Full CMI data model state' },
    },
    {
      name: 'xapiStatements',
      type: 'json',
      admin: { description: 'xAPI statements for this attempt' },
    },
    {
      name: 'interactions',
      type: 'array',
      admin: { description: 'Recorded interactions/questions' },
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'True/False', value: 'true-false' },
            { label: 'Choice', value: 'choice' },
            { label: 'Fill In', value: 'fill-in' },
            { label: 'Long Fill In', value: 'long-fill-in' },
            { label: 'Matching', value: 'matching' },
            { label: 'Performance', value: 'performance' },
            { label: 'Sequencing', value: 'sequencing' },
            { label: 'Likert', value: 'likert' },
            { label: 'Numeric', value: 'numeric' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'learnerResponse',
          type: 'text',
        },
        {
          name: 'correctResponse',
          type: 'text',
        },
        {
          name: 'result',
          type: 'select',
          options: [
            { label: 'Correct', value: 'correct' },
            { label: 'Incorrect', value: 'incorrect' },
            { label: 'Neutral', value: 'neutral' },
          ],
        },
        {
          name: 'weighting',
          type: 'number',
        },
        {
          name: 'latency',
          type: 'text',
          admin: { description: 'Time to respond (ISO 8601 duration)' },
        },
        {
          name: 'timestamp',
          type: 'date',
        },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
    },
    {
      name: 'exitReason',
      type: 'select',
      options: [
        { label: 'Time Out', value: 'time-out' },
        { label: 'Suspend', value: 'suspend' },
        { label: 'Logout', value: 'logout' },
        { label: 'Normal', value: 'normal' },
      ],
    },
  ],
  timestamps: true,
};

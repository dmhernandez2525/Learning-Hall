import { CollectionConfig } from 'payload/types';

const QuizAttempts: CollectionConfig = {
  slug: 'quiz-attempts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'quiz', 'score', 'percentage', 'status'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin' || req.user.role === 'instructor') return true;
      return { user: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { user: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'inProgress',
      options: [
        { label: 'In Progress', value: 'inProgress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Timed Out', value: 'timedOut' },
      ],
    },
    {
      name: 'score',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'maxScore',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'percentage',
      type: 'number',
      admin: {
        description: 'Calculated score percentage',
      },
    },
    {
      name: 'passed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'retakeIndex',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Which attempt number this represents for the learner',
      },
    },
    {
      name: 'timeLimit',
      type: 'number',
      admin: {
        description: 'Time limit snapshot (minutes) applied to this attempt',
      },
    },
    {
      name: 'durationSeconds',
      type: 'number',
      admin: {
        description: 'How long the learner spent before submitting',
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'questions',
      type: 'array',
      required: true,
      admin: {
        description: 'Snapshot of the questions served to the learner',
      },
      fields: [
        {
          name: 'questionId',
          type: 'text',
        },
        {
          name: 'questionType',
          type: 'select',
          options: [
            { label: 'Multiple Choice', value: 'multipleChoice' },
            { label: 'True / False', value: 'trueFalse' },
            { label: 'Short Answer', value: 'shortAnswer' },
            { label: 'Matching', value: 'matching' },
          ],
        },
        {
          name: 'prompt',
          type: 'textarea',
        },
        {
          name: 'options',
          type: 'json',
        },
        {
          name: 'matchOptions',
          type: 'json',
        },
        {
          name: 'correctAnswer',
          type: 'json',
        },
        {
          name: 'response',
          type: 'json',
        },
        {
          name: 'explanation',
          type: 'textarea',
        },
        {
          name: 'pointsPossible',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'pointsEarned',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'feedback',
      type: 'textarea',
      admin: {
        description: 'Optional instructor feedback left on this attempt',
      },
    },
  ],
  timestamps: true,
};

export default QuizAttempts;

import { CollectionConfig } from 'payload/types';

const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'status', 'passingScore', 'timeLimit'],
    group: 'Content',
    description: 'Reusable assessments with rich analytics, timers, and grading controls',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the title if left blank',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only published quizzes can be assigned to lessons',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      hasMany: false,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short summary visible in course builder and analytics',
      },
    },
    {
      name: 'instructions',
      type: 'textarea',
      admin: {
        description: 'Detailed instructions presented to learners before they start',
      },
    },
    {
      name: 'passingScore',
      type: 'number',
      required: true,
      defaultValue: 70,
      min: 0,
      max: 100,
      admin: {
        description: 'Minimum percentage required to pass',
      },
    },
    {
      name: 'timeLimit',
      type: 'number',
      admin: {
        description: 'Time limit in minutes. Leave blank or 0 for untimed quizzes.',
      },
    },
    {
      name: 'retakes',
      type: 'number',
      defaultValue: -1,
      admin: {
        description: 'How many graded attempts are allowed per learner. -1 means unlimited.',
      },
    },
    {
      name: 'randomizeQuestions',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Shuffle the order of questions for each attempt',
      },
    },
    {
      name: 'shuffleAnswers',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Randomize choice order inside each multiple choice question',
      },
    },
    {
      name: 'questionsPerAttempt',
      type: 'number',
      admin: {
        description: 'Optional question pool size. Leave blank to use the entire bank.',
      },
      validate: (value) => {
        if (value && value < 1) {
          return 'Must be at least 1 when provided';
        }
        return true;
      },
    },
    {
      name: 'showExplanations',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Reveal question explanations after the learner submits',
      },
    },
    {
      name: 'allowReview',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Let learners review their answers after submitting',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'modules',
      hasMany: true,
      admin: {
        description: 'Optional module links for organization and analytics filtering',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        description: 'System generated performance data',
        readOnly: true,
      },
      fields: [
        {
          name: 'questionCount',
          type: 'number',
        },
        {
          name: 'averageScore',
          type: 'number',
        },
        {
          name: 'attemptCount',
          type: 'number',
        },
        {
          name: 'passRate',
          type: 'number',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }

        if (typeof data.questionsPerAttempt === 'number' && data.questionsPerAttempt < 1) {
          data.questionsPerAttempt = undefined;
        }

        return data;
      },
    ],
  },
};

export default Quizzes;

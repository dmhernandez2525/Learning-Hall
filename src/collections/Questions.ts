import type { CollectionConfig } from 'payload';

const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'questionText',
    defaultColumns: ['questionText', 'questionType', 'quiz', 'points'],
    group: 'Content',
    description: 'Centralized question bank powering the quiz engine',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
      hasMany: false,
    },
    {
      name: 'questionText',
      type: 'textarea',
      required: true,
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
      required: true,
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      admin: {
        description: 'Used in analytics to highlight tricky questions',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Optional topic tags (press enter to add)',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
        },
      ],
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 1,
      min: 0.5,
      admin: {
        description: 'Points awarded for a correct answer',
      },
    },
    {
      name: 'options',
      type: 'array',
      admin: {
        condition: (data: Record<string, unknown>) => ['multipleChoice', 'matching'].includes(data.questionType as string),
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (_: unknown, siblingData: Record<string, unknown>) => siblingData?.questionType === 'multipleChoice',
          },
        },
        {
          name: 'match',
          type: 'text',
          admin: {
            condition: (_: unknown, siblingData: Record<string, unknown>) => siblingData?.questionType === 'matching',
            description: 'Expected match for this prompt',
          },
        },
      ],
    },
    {
      name: 'trueFalseAnswer',
      type: 'radio',
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
      admin: {
        condition: (data: Record<string, unknown>) => data.questionType === 'trueFalse',
      },
    },
    {
      name: 'shortAnswer',
      type: 'textarea',
      admin: {
        condition: (data: Record<string, unknown>) => data.questionType === 'shortAnswer',
        description: 'Reference answer. We use a case-insensitive contains match.',
      },
    },
    {
      name: 'explanation',
      type: 'textarea',
      admin: {
        description: 'Shown to learners after they submit when explanations are enabled',
      },
    },
  ],
};

export default Questions;

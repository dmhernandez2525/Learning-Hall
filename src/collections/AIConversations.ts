import type { CollectionConfig } from 'payload';

export const AIConversations: CollectionConfig = {
  slug: 'ai-conversations',
  admin: {
    useAsTitle: 'id',
    group: 'AI',
    description: 'AI learning assistant conversations',
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
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { user: { equals: user?.id } };
    },
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
      name: 'context',
      type: 'group',
      fields: [
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
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
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Auto-generated conversation title' },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'openai',
      options: [
        { label: 'OpenAI (GPT-4)', value: 'openai' },
        { label: 'Anthropic (Claude)', value: 'anthropic' },
        { label: 'Google (Gemini)', value: 'google' },
        { label: 'Ollama (Local)', value: 'ollama' },
      ],
    },
    {
      name: 'model',
      type: 'text',
      admin: { description: 'Specific model used' },
    },
    {
      name: 'messages',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'System', value: 'system' },
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
          ],
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'timestamp',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'tokensUsed',
          type: 'number',
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      fields: [
        {
          name: 'totalTokens',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'promptTokens',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'completionTokens',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'estimatedCost',
          type: 'number',
          admin: { description: 'Estimated cost in cents' },
        },
      ],
    },
    {
      name: 'feedback',
      type: 'group',
      fields: [
        {
          name: 'helpful',
          type: 'checkbox',
        },
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
        },
        {
          name: 'comment',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Flagged', value: 'flagged' },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
};

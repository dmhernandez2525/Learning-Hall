import type { CollectionConfig } from 'payload';

const SpacedRepetitionCards: CollectionConfig = {
  slug: 'spaced-repetition-cards',
  admin: { group: 'Microlearning' },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user?.tenant) data.tenant = req.user.tenant;
        return data;
      },
    ],
  },
  fields: [
    { name: 'lesson', type: 'relationship', relationTo: 'micro-lessons', required: true },
    { name: 'question', type: 'textarea', required: true },
    { name: 'answer', type: 'textarea', required: true },
    { name: 'interval', type: 'number', defaultValue: 1, min: 1 },
    { name: 'nextReviewAt', type: 'date', required: true },
    { name: 'easeFactor', type: 'number', defaultValue: 2.5 },
    { name: 'repetitions', type: 'number', defaultValue: 0, min: 0 },
    { name: 'tenant', type: 'text', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
};

export default SpacedRepetitionCards;

import {
  lexicalEditor,
  HeadingFeature,
  ParagraphFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  LinkFeature,
  UnorderedListFeature,
  OrderedListFeature,
  ChecklistFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  BlocksFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical';

/**
 * Custom Lexical editor configuration for lesson content
 * Includes all common formatting options plus media embedding
 */
export const lessonEditor = lexicalEditor({
  features: () => [
    // Text formatting
    ParagraphFeature(),
    HeadingFeature({
      enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
    }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    InlineCodeFeature(),

    // Structural elements
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),

    // Links
    LinkFeature({
      enabledCollections: ['courses', 'lessons'],
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'rel',
          label: 'Rel Attribute',
          type: 'select',
          options: [
            { label: 'None', value: '' },
            { label: 'No Follow', value: 'nofollow' },
            { label: 'No Opener', value: 'noopener' },
            { label: 'No Referrer', value: 'noreferrer' },
          ],
        },
      ],
    }),

    // Media embedding
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'caption',
              type: 'text',
              label: 'Caption',
            },
            {
              name: 'alignment',
              type: 'select',
              label: 'Alignment',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
                { label: 'Full Width', value: 'full' },
              ],
              defaultValue: 'center',
            },
          ],
        },
      },
    }),
  ],
});

/**
 * Simplified editor for short content (descriptions, notes)
 */
export const simpleEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
  ],
});

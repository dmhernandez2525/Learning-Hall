import type { CollectionConfig } from 'payload';
import { sanitizeNoteHtml, extractPlainText } from '@/lib/richtext';
import { getLesson } from '@/lib/lessons';

const LessonNotes: CollectionConfig = {
  slug: 'lesson-notes',
  admin: {
    group: 'Community',
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'lesson', 'videoTimestamp', 'updatedAt'],
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
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      minLength: 3,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'HTML content stored from the student notes composer',
      },
    },
    {
      name: 'plainText',
      type: 'textarea',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'videoTimestamp',
      type: 'number',
      admin: {
        description: 'Optional timestamp (in seconds) to jump back to a spot in the lesson video',
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'lastExportedAt',
          type: 'date',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.user) {
          data.user = req.user.id;
        }

        if (data.content) {
          const sanitized = sanitizeNoteHtml(String(data.content));
          data.content = sanitized;
          data.plainText = extractPlainText(sanitized);
        }

        if (operation === 'create' && data.lesson && !data.course) {
          const lessonId = typeof data.lesson === 'object' ? data.lesson.id : data.lesson;
          const lesson = await getLesson(String(lessonId));
          if (lesson?.module?.course?.id) {
            data.course = lesson.module.course.id;
          }
        }

        return data;
      },
    ],
  },
  timestamps: true,
};

export default LessonNotes;

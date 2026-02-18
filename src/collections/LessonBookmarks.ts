import type { CollectionConfig } from 'payload';
import { getLesson } from '@/lib/lessons';
import { requireCourseAccess } from '@/lib/courses/access';
import type { User } from '@/lib/auth/config';

const LessonBookmarks: CollectionConfig = {
  slug: 'lesson-bookmarks',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'lesson', 'videoTimestamp', 'createdAt'],
    group: 'Engagement',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      return { user: { equals: req.user.id } };
    },
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    update: () => false,
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
    },
    {
      name: 'position',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Used for ordering the learning queue (lower first)',
      },
    },
    {
      name: 'videoTimestamp',
      type: 'number',
      admin: {
        description: 'Bookmark timestamp in seconds',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      maxLength: 500,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.user) {
          data.user = req.user.id;
        }
        if (operation === 'create' && data.lesson) {
          const lessonId = typeof data.lesson === 'object' ? data.lesson.id : data.lesson;
          const lesson = await getLesson(String(lessonId));
          if (lesson?.module?.course?.id) {
            data.course = lesson.module.course.id;
            await requireCourseAccess(lesson.module.course.id, req.user as unknown as User);
          }
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default LessonBookmarks;

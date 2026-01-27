import type { CollectionConfig } from 'payload';
import { requireCourseAccess } from '@/lib/courses/access';
import type { User } from '@/lib/auth/config';

const CourseFavorites: CollectionConfig = {
  slug: 'course-favorites',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'createdAt'],
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
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.user) {
          data.user = req.user.id;
        }
        if (operation === 'create' && data.course && req.user) {
          const courseId = typeof data.course === 'object' ? data.course.id : data.course;
          await requireCourseAccess(String(courseId), req.user as unknown as User);
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default CourseFavorites;

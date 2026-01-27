import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload';
import { getPayload } from 'payload';
import config from '../payload.config';

interface CourseProgressData {
  user?: string | number;
  course?: string | number;
  completedLessons?: Array<string | number>;
  progressPercentage?: number;
}

interface ModuleWithLessons {
  lessons?: Array<unknown>;
}

const calculateProgress: CollectionBeforeChangeHook = async ({ data }) => {
  const progressData = data as CourseProgressData;
  const payload = await getPayload({ config });

  if (progressData.course) {
    const course = await payload.findByID({
      collection: 'courses',
      id: progressData.course,
      depth: 2,
    });

    if (course && course.modules) {
      const modules = course.modules as ModuleWithLessons[];
      const totalLessons = modules.reduce(
        (acc: number, courseModule: ModuleWithLessons) =>
          acc + (courseModule.lessons?.length || 0),
        0,
      );

      if (totalLessons > 0) {
        const completedCount = Array.isArray(progressData.completedLessons)
          ? progressData.completedLessons.length
          : 0;
        progressData.progressPercentage = Math.round(
          (completedCount / totalLessons) * 100,
        );
      } else {
        progressData.progressPercentage = 0;
      }
    }
  }
  return progressData;
};

export const CourseProgress: CollectionConfig = {
  slug: 'course-progress',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'progressPercentage', 'updatedAt'],
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
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'completedLessons',
      type: 'relationship',
      relationTo: 'lessons',
      hasMany: true,
      admin: {
        description: 'Lessons the user has completed in this course',
      },
    },
    {
      name: 'progressPercentage',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
      admin: {
        readOnly: true,
        description: 'Auto-calculated based on completed lessons',
      },
    },
    {
      name: 'lastAccessedLesson',
      type: 'relationship',
      relationTo: 'lessons',
      admin: {
        description: 'Last lesson the user accessed (for resume functionality)',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [calculateProgress],
  },
  timestamps: true,
};

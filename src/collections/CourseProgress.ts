
import { CollectionConfig } from 'payload/types'
import { getPayload } from 'payload'
import config from '../payload.config'

export const CourseProgress: CollectionConfig = {
  slug: 'course-progress',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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
    },
    {
      name: 'progressPercentage',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const payload = await getPayload({ config });

        if (data.course) {
          const course = await payload.findByID({
            collection: 'courses',
            id: data.course,
            depth: 2,
          });

          if (course && course.modules) {
            const totalLessons = course.modules.reduce(
              (acc, module) => acc + (module.lessons?.length || 0),
              0,
            );

            if (totalLessons > 0) {
              const completedLessons = Array.isArray(data.completedLessons)
                ? data.completedLessons.length
                : 0;
              data.progressPercentage = Math.round(
                (completedLessons / totalLessons) * 100,
              );
            } else {
              data.progressPercentage = 0;
            }
          }
        }
        return data;
      },
    ],
  },
}

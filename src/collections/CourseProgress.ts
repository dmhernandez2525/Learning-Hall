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
        const progressPercentage = Math.round(
          (completedCount / totalLessons) * 100,
        );
        progressData.progressPercentage = progressPercentage;

        if (progressPercentage === 100 && progressData.user && progressData.course) {
          const { docs: existingCertificates } = await payload.find({
            collection: 'certificates',
            where: {
              and: [
                { user: { equals: progressData.user } },
                { course: { equals: progressData.course } },
              ],
            },
          });

          if (existingCertificates.length === 0) {
            // Get the course's certificate template settings
            const courseData = course as {
              settings?: { certificateEnabled?: boolean };
              certificateTemplate?: Record<string, unknown>;
              instructor?: { name?: string } | string | number;
            };

            // Only create certificate if enabled for this course
            if (courseData.settings?.certificateEnabled !== false) {
              const certificateTemplate = courseData.certificateTemplate || {};
              const instructorName = typeof courseData.instructor === 'object'
                ? courseData.instructor?.name
                : undefined;

              // Merge course template settings into certificate
              const templateData: Record<string, unknown> = {
                style: certificateTemplate.style || 'classic',
              };

              if (certificateTemplate.primaryColor) {
                templateData.primaryColor = certificateTemplate.primaryColor;
              }
              if (certificateTemplate.accentColor) {
                templateData.accentColor = certificateTemplate.accentColor;
              }
              if (certificateTemplate.logo) {
                templateData.logo = certificateTemplate.logo;
              }
              if (certificateTemplate.backgroundImage) {
                templateData.backgroundImage = certificateTemplate.backgroundImage;
              }
              if (certificateTemplate.signatureName || instructorName) {
                templateData.signatureName = certificateTemplate.signatureName || instructorName;
              }
              if (certificateTemplate.signatureTitle) {
                templateData.signatureTitle = certificateTemplate.signatureTitle;
              }
              if (certificateTemplate.signatureImage) {
                templateData.signatureImage = certificateTemplate.signatureImage;
              }
              if (certificateTemplate.additionalText) {
                templateData.additionalText = certificateTemplate.additionalText;
              }
              if (certificateTemplate.credentialId) {
                templateData.credentialId = certificateTemplate.credentialId;
              }

              await payload.create({
                collection: 'certificates',
                data: {
                  user: progressData.user,
                  course: progressData.course,
                  completionDate: new Date().toISOString(),
                  template: templateData,
                },
              });
            }
          }
        }
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

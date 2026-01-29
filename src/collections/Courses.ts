import type { CollectionConfig, Where } from 'payload';
import { getPayload } from 'payload';
import config from '../payload.config';

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'instructor', 'status', 'accessType', 'pricing.amount', 'updatedAt'],
    group: 'Content',
    description: 'Online courses with modules and lessons',
  },
  access: {
    read: ({ req }) => {
      // Admins can read all
      if (req.user?.role === 'admin') return true;

      // For non-admin users, filter by their tenant
      // Show courses that:
      // 1. Have no tenant (global courses - backwards compatibility)
      // 2. Match the user's tenant
      if (req.user?.tenant) {
        return {
          or: [
            { tenant: { exists: false } },
            { tenant: { equals: req.user.tenant } },
          ],
        } as Where;
      }

      // Guest users see only courses without tenant
      return { tenant: { exists: false } } as Where;
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Instructors can only update their own courses
      return { instructor: { equals: req.user.id } };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-generate slug from title
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        return data;
      },
      async ({ data, req, operation }) => {
        // Set instructor to current user on create
        if (operation === 'create' && !data.instructor) {
          data.instructor = req.user?.id;
        }
        // Auto-assign tenant from user on create
        if (operation === 'create' && !data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant;
        }
        return data;
      },
      async ({ data, operation }) => {
        if (data.status === 'published') {
            const payload = await getPayload({ config });
            const course = await payload.findByID({
                collection: 'courses',
                id: data.id,
                depth: 2,
            });

            if(!course.modules || course.modules.length === 0) {
                throw new Error('A course must have at least one module to be published.');
            }

            const hasLessons = course.modules.some((courseModule: { lessons?: unknown[] }) =>
              courseModule.lessons && courseModule.lessons.length > 0
            );

            if(!hasLessons) {
                throw new Error('A course must have at least one lesson to be published.');
            }

            if(operation === 'update') {
                data.publishedAt = new Date().toISOString();
            }

        }
        return data;
      }
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 200,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Brief description for course cards (max 300 chars)',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Access & Pricing
    {
      name: 'accessType',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Paid', value: 'paid' },
        { label: 'Subscription Only', value: 'subscription' },
        { label: 'Private (Invite Only)', value: 'private' },
      ],
      admin: {
        description: 'How users can access this course',
        position: 'sidebar',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        condition: (data) => data?.accessType === 'paid',
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Price in cents (e.g., 4999 = $49.99)',
          },
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          defaultValue: 'USD',
          options: [
            { label: 'USD ($)', value: 'USD' },
            { label: 'EUR (€)', value: 'EUR' },
            { label: 'GBP (£)', value: 'GBP' },
          ],
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'Original price (for showing discounts)',
          },
        },
        {
          name: 'saleEndsAt',
          type: 'date',
          admin: {
            description: 'Sale price expires at this date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    // Access Control Settings
    {
      name: 'accessControl',
      type: 'group',
      fields: [
        {
          name: 'requiresEnrollment',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Users must be enrolled to access full content',
          },
        },
        {
          name: 'allowGuestPreview',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Non-logged in users can see course info and preview lessons',
          },
        },
        {
          name: 'maxEnrollments',
          type: 'number',
          min: 0,
          admin: {
            description: 'Maximum number of enrollments (0 = unlimited)',
          },
        },
        {
          name: 'enrollmentStartDate',
          type: 'date',
          admin: {
            description: 'Enrollment opens at this date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'enrollmentEndDate',
          type: 'date',
          admin: {
            description: 'Enrollment closes at this date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'accessDuration',
          type: 'number',
          min: 0,
          admin: {
            description: 'Access duration in days after enrollment (0 = lifetime)',
          },
        },
      ],
    },
    {
      name: 'modules',
      type: 'relationship',
      relationTo: 'modules',
      hasMany: true,
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'allowPreview',
          type: 'checkbox',
          defaultValue: true,
          label: 'Allow preview lessons',
        },
        {
          name: 'requireSequentialProgress',
          type: 'checkbox',
          defaultValue: false,
          label: 'Require sequential lesson completion',
        },
        {
          name: 'certificateEnabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Issue certificate on completion',
        },
      ],
    },
    // Certificate template customization
    {
      name: 'certificateTemplate',
      type: 'group',
      admin: {
        description: 'Customize the certificate template for this course',
        condition: (data) => data?.settings?.certificateEnabled !== false,
      },
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'classic',
          options: [
            { label: 'Classic', value: 'classic' },
            { label: 'Modern', value: 'modern' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Professional', value: 'professional' },
            { label: 'Elegant', value: 'elegant' },
          ],
          admin: {
            description: 'Visual style of the certificate',
          },
        },
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#1a365d',
          admin: {
            description: 'Primary color (hex code)',
          },
        },
        {
          name: 'accentColor',
          type: 'text',
          defaultValue: '#e2e8f0',
          admin: {
            description: 'Accent color (hex code)',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Custom logo for the certificate (defaults to site logo)',
          },
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Background image or pattern',
          },
        },
        {
          name: 'signatureName',
          type: 'text',
          admin: {
            description: 'Name to display as signature (defaults to instructor name)',
          },
        },
        {
          name: 'signatureTitle',
          type: 'text',
          defaultValue: 'Course Instructor',
          admin: {
            description: 'Title under signature',
          },
        },
        {
          name: 'signatureImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Signature image',
          },
        },
        {
          name: 'additionalText',
          type: 'textarea',
          admin: {
            description: 'Additional text to display on certificate',
          },
        },
        {
          name: 'credentialId',
          type: 'text',
          admin: {
            description: 'Credential/accreditation ID to display',
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
        },
      ],
    },
    {
      name: 'reviewStats',
      type: 'group',
      admin: {
        description: 'Aggregated review statistics (auto-calculated)',
        readOnly: true,
      },
      fields: [
        {
          name: 'averageRating',
          type: 'number',
          admin: {
            description: 'Average star rating (1-5)',
          },
        },
        {
          name: 'totalReviews',
          type: 'number',
          admin: {
            description: 'Total number of approved reviews',
          },
        },
        {
          name: 'ratingDistribution',
          type: 'json',
          admin: {
            description: 'Count of reviews per star rating {1: n, 2: n, ...}',
          },
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        position: 'sidebar',
        description: 'Tenant this course belongs to (for white-label)',
      },
    },
  ],
  timestamps: true,
};

// Type definitions for course access checking
export interface CourseAccessResult {
  hasAccess: boolean;
  reason: 'enrolled' | 'free' | 'preview' | 'owner' | 'admin' | 'no_enrollment' | 'expired' | 'not_started' | 'closed';
  canEnroll: boolean;
  enrollmentStatus?: 'open' | 'closed' | 'full' | 'not_started';
}

export interface CourseData {
  id: string | number;
  accessType: 'free' | 'paid' | 'subscription' | 'private';
  instructor?: { id: string | number } | string | number;
  accessControl?: {
    requiresEnrollment?: boolean;
    allowGuestPreview?: boolean;
    maxEnrollments?: number;
    enrollmentStartDate?: string;
    enrollmentEndDate?: string;
    accessDuration?: number;
  };
}

export interface EnrollmentData {
  id: string | number;
  user: { id: string | number } | string | number;
  course: { id: string | number } | string | number;
  status: 'active' | 'completed' | 'expired';
  enrolledAt?: string;
  expiresAt?: string;
}

export interface UserData {
  id: string | number;
  role?: 'admin' | 'instructor' | 'student';
}

/**
 * Check if a user has access to a course
 */
export function checkCourseAccess(
  course: CourseData,
  user: UserData | null,
  enrollment: EnrollmentData | null,
  currentEnrollmentCount: number = 0
): CourseAccessResult {
  const now = new Date();

  // Admin always has access
  if (user?.role === 'admin') {
    return { hasAccess: true, reason: 'admin', canEnroll: true };
  }

  // Course owner (instructor) always has access
  const instructorId = typeof course.instructor === 'object'
    ? course.instructor?.id
    : course.instructor;
  if (user && instructorId === user.id) {
    return { hasAccess: true, reason: 'owner', canEnroll: false };
  }

  // Check enrollment status
  const enrollmentStatus = getEnrollmentStatus(course, currentEnrollmentCount, now);

  // Free courses
  if (course.accessType === 'free') {
    return { hasAccess: true, reason: 'free', canEnroll: enrollmentStatus === 'open' };
  }

  // Check if user has valid enrollment
  if (enrollment) {
    // Check if enrollment is active
    if (enrollment.status === 'expired') {
      return { hasAccess: false, reason: 'expired', canEnroll: enrollmentStatus === 'open', enrollmentStatus };
    }

    // Check if access has expired based on duration
    if (course.accessControl?.accessDuration && enrollment.enrolledAt) {
      const enrolledDate = new Date(enrollment.enrolledAt);
      const expiryDate = new Date(enrolledDate);
      expiryDate.setDate(expiryDate.getDate() + course.accessControl.accessDuration);

      if (now > expiryDate) {
        return { hasAccess: false, reason: 'expired', canEnroll: enrollmentStatus === 'open', enrollmentStatus };
      }
    }

    return { hasAccess: true, reason: 'enrolled', canEnroll: false, enrollmentStatus };
  }

  // No enrollment - check if preview is allowed
  if (course.accessControl?.allowGuestPreview !== false) {
    return { hasAccess: false, reason: 'preview', canEnroll: enrollmentStatus === 'open', enrollmentStatus };
  }

  return { hasAccess: false, reason: 'no_enrollment', canEnroll: enrollmentStatus === 'open', enrollmentStatus };
}

/**
 * Get enrollment status for a course
 */
function getEnrollmentStatus(
  course: CourseData,
  currentCount: number,
  now: Date
): 'open' | 'closed' | 'full' | 'not_started' {
  const { accessControl } = course;

  if (!accessControl) return 'open';

  // Check max enrollments
  if (accessControl.maxEnrollments && currentCount >= accessControl.maxEnrollments) {
    return 'full';
  }

  // Check enrollment start date
  if (accessControl.enrollmentStartDate) {
    const startDate = new Date(accessControl.enrollmentStartDate);
    if (now < startDate) {
      return 'not_started';
    }
  }

  // Check enrollment end date
  if (accessControl.enrollmentEndDate) {
    const endDate = new Date(accessControl.enrollmentEndDate);
    if (now > endDate) {
      return 'closed';
    }
  }

  return 'open';
}

/**
 * Format price for display
 */
export function formatCoursePrice(
  amount: number,
  currency: string = 'USD'
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount / 100);
}

import type { CollectionConfig } from 'payload';

const CourseReviews: CollectionConfig = {
  slug: 'course-reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'user', 'rating', 'status', 'createdAt'],
    group: 'Engagement',
    description: 'Course ratings and written reviews from enrolled students',
  },
  access: {
    read: ({ req }) => {
      // Admins/instructors see all, others see only approved
      if (req.user?.role === 'admin' || req.user?.role === 'instructor') {
        return true;
      }
      return { status: { equals: 'approved' } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Users can only update their own reviews
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
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: '1-5 star rating',
      },
    },
    {
      name: 'title',
      type: 'text',
      maxLength: 100,
      admin: {
        description: 'Brief summary of the review',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Detailed review text (minimum 50 characters for approved reviews)',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Moderation status',
      },
    },
    {
      name: 'verifiedPurchase',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'True if user was enrolled when reviewing',
      },
    },
    {
      name: 'helpfulVotes',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Number of "helpful" votes',
      },
    },
    {
      name: 'helpfulVoters',
      type: 'array',
      admin: {
        description: 'Users who voted this review as helpful',
        readOnly: true,
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
    },
    {
      name: 'instructorResponse',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Response from the course instructor',
      },
    },
    {
      name: 'respondedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set user on create
        if (operation === 'create' && req.user && !data.user) {
          data.user = req.user.id;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update course review stats when a review is approved
        if (doc.status === 'approved') {
          try {
            const payload = req.payload;
            const courseId = typeof doc.course === 'object' ? doc.course.id : doc.course;

            // Get all approved reviews for this course
            const reviews = await payload.find({
              collection: 'course-reviews',
              where: {
                and: [
                  { course: { equals: courseId } },
                  { status: { equals: 'approved' } },
                ],
              },
              limit: 10000,
            });

            // Calculate stats
            const totalReviews = reviews.totalDocs;
            const avgRating = totalReviews > 0
              ? reviews.docs.reduce((sum, r) => sum + (r.rating as number), 0) / totalReviews
              : 0;

            // Rating distribution
            const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.docs.forEach((r) => {
              const rating = r.rating as number;
              distribution[rating] = (distribution[rating] || 0) + 1;
            });

            // Update course with review stats
            await payload.update({
              collection: 'courses',
              id: courseId,
              data: {
                reviewStats: {
                  averageRating: Math.round(avgRating * 10) / 10,
                  totalReviews,
                  ratingDistribution: distribution,
                },
              },
            });
          } catch (error) {
            console.error('Failed to update course review stats:', error);
          }
        }
      },
    ],
  },
  timestamps: true,
};

export default CourseReviews;

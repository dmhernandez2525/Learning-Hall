import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';

export interface CourseReview {
  id: string;
  user: {
    id: string;
    name?: string;
  };
  course: {
    id: string;
    title?: string;
  };
  rating: number;
  title?: string;
  content?: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedPurchase: boolean;
  helpfulVotes: number;
  hasVotedHelpful?: boolean;
  instructorResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface ReviewListResult {
  docs: CourseReview[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

function formatReview(doc: Record<string, unknown>, currentUserId?: string): CourseReview {
  const user = doc.user as Record<string, unknown> | string;
  const course = doc.course as Record<string, unknown> | string;
  const helpfulVoters = (doc.helpfulVoters as Array<{ user: string | Record<string, unknown> }>) || [];

  const hasVotedHelpful = currentUserId
    ? helpfulVoters.some((v) => {
        const voterId = typeof v.user === 'object' ? String((v.user as Record<string, unknown>).id) : String(v.user);
        return voterId === currentUserId;
      })
    : undefined;

  return {
    id: String(doc.id),
    user:
      typeof user === 'object'
        ? { id: String(user.id), name: user.name ? String(user.name) : undefined }
        : { id: String(user) },
    course:
      typeof course === 'object'
        ? { id: String(course.id), title: course.title ? String(course.title) : undefined }
        : { id: String(course) },
    rating: Number(doc.rating),
    title: doc.title ? String(doc.title) : undefined,
    content: doc.content ? String(doc.content) : undefined,
    status: String(doc.status) as 'pending' | 'approved' | 'rejected',
    verifiedPurchase: Boolean(doc.verifiedPurchase),
    helpfulVotes: Number(doc.helpfulVotes || 0),
    hasVotedHelpful,
    instructorResponse: doc.instructorResponse ? String(doc.instructorResponse) : undefined,
    respondedAt: doc.respondedAt ? String(doc.respondedAt) : undefined,
    createdAt: String(doc.createdAt || new Date().toISOString()),
  };
}

export async function listCourseReviews(
  courseId: string,
  options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    status?: 'pending' | 'approved' | 'rejected';
  } = {},
  currentUserId?: string
): Promise<ReviewListResult> {
  const { page = 1, limit = 10, sort = 'newest', status = 'approved' } = options;

  const payload = await getPayloadClient();

  let sortField: string;
  switch (sort) {
    case 'oldest':
      sortField = 'createdAt';
      break;
    case 'highest':
      sortField = '-rating';
      break;
    case 'lowest':
      sortField = 'rating';
      break;
    case 'helpful':
      sortField = '-helpfulVotes';
      break;
    default:
      sortField = '-createdAt';
  }

  const result = await payload.find({
    collection: 'course-reviews',
    where: {
      and: [{ course: { equals: courseId } }, { status: { equals: status } }],
    },
    sort: sortField,
    page,
    limit,
    depth: 1,
  });

  return {
    docs: result.docs.map((doc) => formatReview(doc as Record<string, unknown>, currentUserId)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getReview(reviewId: string, currentUserId?: string): Promise<CourseReview | null> {
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findByID({
      collection: 'course-reviews',
      id: reviewId,
      depth: 1,
    });
    return formatReview(doc as Record<string, unknown>, currentUserId);
  } catch {
    return null;
  }
}

export async function createReview(
  courseId: string,
  data: {
    rating: number;
    title?: string;
    content?: string;
  },
  user: User
): Promise<CourseReview> {
  const payload = await getPayloadClient();

  // Check if user already reviewed this course
  const existing = await payload.find({
    collection: 'course-reviews',
    where: {
      and: [{ user: { equals: user.id } }, { course: { equals: courseId } }],
    },
    limit: 1,
  });

  if (existing.totalDocs > 0) {
    throw new Error('You have already reviewed this course');
  }

  // Check if user is enrolled (verified purchase)
  const enrollment = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { user: { equals: user.id } },
        { course: { equals: courseId } },
        { status: { not_equals: 'expired' } },
      ],
    },
    limit: 1,
  });

  const verifiedPurchase = enrollment.totalDocs > 0;

  const doc = await payload.create({
    collection: 'course-reviews',
    data: {
      user: user.id,
      course: courseId,
      rating: data.rating,
      title: data.title,
      content: data.content,
      verifiedPurchase,
      status: 'pending', // All reviews start as pending
    },
  });

  return formatReview(doc as Record<string, unknown>, user.id);
}

export async function updateReview(
  reviewId: string,
  data: {
    rating?: number;
    title?: string;
    content?: string;
  },
  user: User
): Promise<CourseReview> {
  const payload = await getPayloadClient();

  // Verify ownership
  const existing = await payload.findByID({
    collection: 'course-reviews',
    id: reviewId,
    depth: 0,
  });

  const ownerId = typeof existing.user === 'object' ? String((existing.user as Record<string, unknown>).id) : String(existing.user);
  if (ownerId !== user.id && user.role !== 'admin') {
    throw new Error('Not authorized to update this review');
  }

  const doc = await payload.update({
    collection: 'course-reviews',
    id: reviewId,
    data: {
      ...data,
      status: 'pending', // Reset to pending when updated
    },
  });

  return formatReview(doc as Record<string, unknown>, user.id);
}

export async function voteReviewHelpful(reviewId: string, user: User): Promise<CourseReview> {
  const payload = await getPayloadClient();

  const review = await payload.findByID({
    collection: 'course-reviews',
    id: reviewId,
    depth: 0,
  });

  const helpfulVoters = (review.helpfulVoters as Array<{ user: string }>) || [];
  const hasVoted = helpfulVoters.some((v) => v.user === user.id);

  if (hasVoted) {
    throw new Error('You have already voted on this review');
  }

  const doc = await payload.update({
    collection: 'course-reviews',
    id: reviewId,
    data: {
      helpfulVotes: (review.helpfulVotes as number || 0) + 1,
      helpfulVoters: [...helpfulVoters, { user: user.id }],
    },
  });

  return formatReview(doc as Record<string, unknown>, user.id);
}

export async function addInstructorResponse(
  reviewId: string,
  response: string,
  user: User
): Promise<CourseReview> {
  const payload = await getPayloadClient();

  // Verify user is instructor of the course
  const review = await payload.findByID({
    collection: 'course-reviews',
    id: reviewId,
    depth: 2,
  });

  const course = review.course as Record<string, unknown>;
  const instructor = course.instructor as Record<string, unknown> | string;
  const instructorId = typeof instructor === 'object' ? String(instructor.id) : String(instructor);

  if (instructorId !== user.id && user.role !== 'admin') {
    throw new Error('Only the course instructor can respond to reviews');
  }

  const doc = await payload.update({
    collection: 'course-reviews',
    id: reviewId,
    data: {
      instructorResponse: response,
      respondedAt: new Date().toISOString(),
    },
  });

  return formatReview(doc as Record<string, unknown>, user.id);
}

export async function moderateReview(
  reviewId: string,
  status: 'approved' | 'rejected',
  user: User
): Promise<CourseReview> {
  if (user.role !== 'admin' && user.role !== 'instructor') {
    throw new Error('Only admins and instructors can moderate reviews');
  }

  const payload = await getPayloadClient();

  const doc = await payload.update({
    collection: 'course-reviews',
    id: reviewId,
    data: { status },
  });

  return formatReview(doc as Record<string, unknown>, user.id);
}

export async function getReviewStats(courseId: string): Promise<ReviewStats> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'course-reviews',
    where: {
      and: [{ course: { equals: courseId } }, { status: { equals: 'approved' } }],
    },
    limit: 10000,
  });

  const totalReviews = result.totalDocs;

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  result.docs.forEach((doc) => {
    const rating = doc.rating as number;
    sum += rating;
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round((sum / totalReviews) * 10) / 10,
    totalReviews,
    ratingDistribution: distribution,
  };
}

export async function getUserReviewForCourse(courseId: string, userId: string): Promise<CourseReview | null> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'course-reviews',
    where: {
      and: [{ user: { equals: userId } }, { course: { equals: courseId } }],
    },
    limit: 1,
    depth: 1,
  });

  if (result.totalDocs === 0) {
    return null;
  }

  return formatReview(result.docs[0] as Record<string, unknown>, userId);
}

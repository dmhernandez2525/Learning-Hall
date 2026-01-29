// Course Discovery Features
import { getPayload, Where } from 'payload';
import config from '@/payload.config';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount: number;
  icon?: string;
}

export interface DiscoverySection {
  id: string;
  title: string;
  type: 'trending' | 'new' | 'popular' | 'category' | 'featured' | 'continue' | 'recommended';
  courses: DiscoveryCourse[];
}

export interface DiscoveryCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  shortDescription?: string;
  category?: string;
  level?: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  duration?: number;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isFree?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
}

// Get all categories with course counts
export async function getCategories(tenantId?: string): Promise<Category[]> {
  const payload = await getPayload({ config });

  const where: Where = tenantId
    ? {
        and: [
          { status: { equals: 'published' } },
          { tenant: { equals: tenantId } },
        ],
      }
    : { status: { equals: 'published' } };

  const courses = await payload.find({
    collection: 'courses',
    where,
    limit: 10000,
  });

  // Count courses by category
  const categoryCounts: Record<string, number> = {};
  for (const course of courses.docs) {
    const category = course.category as string;
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }

  // Create category objects
  const categories: Category[] = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      courseCount: count,
    }))
    .sort((a, b) => b.courseCount - a.courseCount);

  return categories;
}

// Get course levels with counts
export async function getLevels(tenantId?: string): Promise<{ level: string; count: number }[]> {
  const payload = await getPayload({ config });

  const where: Where = tenantId
    ? {
        and: [
          { status: { equals: 'published' } },
          { tenant: { equals: tenantId } },
        ],
      }
    : { status: { equals: 'published' } };

  const courses = await payload.find({
    collection: 'courses',
    where,
    limit: 10000,
  });

  const levelCounts: Record<string, number> = {};
  for (const course of courses.docs) {
    const level = course.level as string;
    if (level) {
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    }
  }

  return Object.entries(levelCounts)
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => {
      const order = { beginner: 0, intermediate: 1, advanced: 2 };
      return (order[a.level as keyof typeof order] || 99) - (order[b.level as keyof typeof order] || 99);
    });
}

// Get price ranges
export async function getPriceRanges(
  tenantId?: string
): Promise<{ min: number; max: number; label: string; count: number }[]> {
  const payload = await getPayload({ config });

  const where: Where = tenantId
    ? {
        and: [
          { status: { equals: 'published' } },
          { tenant: { equals: tenantId } },
        ],
      }
    : { status: { equals: 'published' } };

  const courses = await payload.find({
    collection: 'courses',
    where,
    limit: 10000,
  });

  const ranges = [
    { min: 0, max: 0, label: 'Free', count: 0 },
    { min: 1, max: 25, label: '$1 - $25', count: 0 },
    { min: 26, max: 50, label: '$26 - $50', count: 0 },
    { min: 51, max: 100, label: '$51 - $100', count: 0 },
    { min: 101, max: Infinity, label: '$100+', count: 0 },
  ];

  for (const course of courses.docs) {
    const price = (course.price as number) || 0;
    for (const range of ranges) {
      if (price >= range.min && price <= range.max) {
        range.count++;
        break;
      }
    }
  }

  return ranges.filter((r) => r.count > 0);
}

// Get discovery page sections
export async function getDiscoverySections(
  userId?: string,
  tenantId?: string
): Promise<DiscoverySection[]> {
  const sections: DiscoverySection[] = [];

  // Continue Learning (if user is logged in)
  if (userId) {
    const continueLearning = await getContinueLearningCourses(userId, tenantId);
    if (continueLearning.length > 0) {
      sections.push({
        id: 'continue-learning',
        title: 'Continue Learning',
        type: 'continue',
        courses: continueLearning,
      });
    }

    // Personalized recommendations
    const recommended = await getRecommendedCourses(userId, tenantId);
    if (recommended.length > 0) {
      sections.push({
        id: 'recommended',
        title: 'Recommended for You',
        type: 'recommended',
        courses: recommended,
      });
    }
  }

  // Featured courses
  const featured = await getFeaturedCourses(tenantId);
  if (featured.length > 0) {
    sections.push({
      id: 'featured',
      title: 'Featured Courses',
      type: 'featured',
      courses: featured,
    });
  }

  // Trending courses
  const trending = await getTrendingCourses(tenantId);
  if (trending.length > 0) {
    sections.push({
      id: 'trending',
      title: 'Trending Now',
      type: 'trending',
      courses: trending,
    });
  }

  // New courses
  const newCourses = await getNewCourses(tenantId);
  if (newCourses.length > 0) {
    sections.push({
      id: 'new',
      title: 'New Releases',
      type: 'new',
      courses: newCourses,
    });
  }

  // Popular courses
  const popular = await getPopularCourses(tenantId);
  if (popular.length > 0) {
    sections.push({
      id: 'popular',
      title: 'Most Popular',
      type: 'popular',
      courses: popular,
    });
  }

  // Top categories
  const categories = await getCategories(tenantId);
  for (const category of categories.slice(0, 3)) {
    const categoryCourses = await getCoursesByCategory(category.name, tenantId, 6);
    if (categoryCourses.length > 0) {
      sections.push({
        id: `category-${category.slug}`,
        title: category.name,
        type: 'category',
        courses: categoryCourses,
      });
    }
  }

  return sections;
}

// Get courses user is currently learning
async function getContinueLearningCourses(
  userId: string,
  tenantId?: string,
  limit: number = 4
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  const enrollments = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { user: { equals: userId } },
        { status: { equals: 'active' } },
      ],
    },
    depth: 2,
    limit: 20,
  });

  const courses: DiscoveryCourse[] = [];

  for (const enrollment of enrollments.docs) {
    const course = enrollment.course;
    if (typeof course !== 'object') continue;

    if (tenantId && String(course.tenant) !== tenantId) continue;

    // Get progress
    const progress = await payload.find({
      collection: 'progress',
      where: {
        and: [
          { user: { equals: userId } },
          { course: { equals: String(course.id) } },
        ],
      },
      limit: 1,
    });

    const progressPercent = progress.docs[0]?.percentage || 0;

    // Only include incomplete courses
    if (progressPercent > 0 && progressPercent < 100) {
      courses.push(formatDiscoveryCourse(course));
    }
  }

  return courses.slice(0, limit);
}

// Get recommended courses for user
async function getRecommendedCourses(
  userId: string,
  tenantId?: string,
  limit: number = 8
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  // Get user's enrolled courses
  const enrollments = await payload.find({
    collection: 'enrollments',
    where: { user: { equals: userId } },
    depth: 2,
    limit: 50,
  });

  const enrolledIds = new Set(
    enrollments.docs.map((e) =>
      typeof e.course === 'object' ? String(e.course.id) : String(e.course)
    )
  );

  // Get categories from enrolled courses
  const categories: string[] = [];
  for (const enrollment of enrollments.docs) {
    const course = enrollment.course;
    if (typeof course === 'object' && course.category) {
      categories.push(String(course.category));
    }
  }

  if (categories.length === 0) {
    return getPopularCourses(tenantId, limit);
  }

  // Find courses in same categories
  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      { category: { in: [...new Set(categories)] } },
      { id: { not_in: Array.from(enrolledIds) } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    sort: '-averageRating',
    limit,
  });

  return courses.docs.map((course) => formatDiscoveryCourse(course));
}

// Get featured courses
async function getFeaturedCourses(
  tenantId?: string,
  limit: number = 6
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      { averageRating: { greater_than_equal: 4.5 } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    sort: '-enrollmentCount',
    limit,
  });

  return courses.docs.map((course) => formatDiscoveryCourse(course));
}

// Get trending courses
async function getTrendingCourses(
  tenantId?: string,
  limit: number = 8
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  // Get recent enrollments
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEnrollments = await payload.find({
    collection: 'enrollments',
    where: {
      createdAt: { greater_than: thirtyDaysAgo.toISOString() },
    },
    limit: 1000,
  });

  // Count by course
  const counts: Record<string, number> = {};
  for (const enrollment of recentEnrollments.docs) {
    const courseId = typeof enrollment.course === 'object'
      ? String(enrollment.course.id)
      : String(enrollment.course);
    counts[courseId] = (counts[courseId] || 0) + 1;
  }

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) {
    return getPopularCourses(tenantId, limit);
  }

  const where: Where = {
    and: [
      { id: { in: topIds } },
      { status: { equals: 'published' } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    limit,
  });

  return courses.docs.map((course) => ({
    ...formatDiscoveryCourse(course),
    isTrending: true,
  }));
}

// Get new courses
async function getNewCourses(
  tenantId?: string,
  limit: number = 8
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    sort: '-createdAt',
    limit,
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return courses.docs.map((course) => ({
    ...formatDiscoveryCourse(course),
    isNew: new Date(course.createdAt) > thirtyDaysAgo,
  }));
}

// Get popular courses
async function getPopularCourses(
  tenantId?: string,
  limit: number = 8
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    sort: '-enrollmentCount',
    limit,
  });

  return courses.docs.map((course) => formatDiscoveryCourse(course));
}

// Get courses by category
async function getCoursesByCategory(
  category: string,
  tenantId?: string,
  limit: number = 6
): Promise<DiscoveryCourse[]> {
  const payload = await getPayload({ config });

  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      { category: { equals: category } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    sort: '-averageRating',
    limit,
  });

  return courses.docs.map((course) => formatDiscoveryCourse(course));
}

// Get instructors
export async function getTopInstructors(
  tenantId?: string,
  limit: number = 10
): Promise<{
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  courseCount: number;
  studentCount: number;
  rating?: number;
}[]> {
  const payload = await getPayload({ config });

  // Get all published courses
  const where: Where = {
    and: [
      { status: { equals: 'published' } },
      ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
    ],
  };

  const courses = await payload.find({
    collection: 'courses',
    where,
    depth: 1,
    limit: 10000,
  });

  // Aggregate by instructor
  const instructorStats: Record<string, {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    courseCount: number;
    studentCount: number;
    totalRating: number;
    ratingCount: number;
  }> = {};

  for (const course of courses.docs) {
    const instructor = course.instructor as Record<string, unknown> | string | undefined;
    if (!instructor || typeof instructor === 'string') continue;

    const instructorId = String(instructor.id);
    if (!instructorStats[instructorId]) {
      instructorStats[instructorId] = {
        id: instructorId,
        name: (instructor.name as string) ||
          `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() ||
          'Unknown',
        avatar: instructor.avatar as string | undefined,
        bio: instructor.bio as string | undefined,
        courseCount: 0,
        studentCount: 0,
        totalRating: 0,
        ratingCount: 0,
      };
    }

    instructorStats[instructorId].courseCount++;
    instructorStats[instructorId].studentCount += (course.enrollmentCount as number) || 0;
    if (course.averageRating) {
      instructorStats[instructorId].totalRating += course.averageRating;
      instructorStats[instructorId].ratingCount++;
    }
  }

  return Object.values(instructorStats)
    .map((stats) => ({
      ...stats,
      rating: stats.ratingCount > 0
        ? Math.round((stats.totalRating / stats.ratingCount) * 10) / 10
        : undefined,
    }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, limit);
}

// Format course for discovery
function formatDiscoveryCourse(course: Record<string, unknown>): DiscoveryCourse {
  const instructor = course.instructor as Record<string, unknown> | undefined;

  return {
    id: String(course.id),
    title: String(course.title),
    slug: String(course.slug),
    thumbnail: typeof course.thumbnail === 'object'
      ? (course.thumbnail as { url?: string })?.url
      : course.thumbnail as string | undefined,
    shortDescription: course.shortDescription as string | undefined,
    category: course.category as string | undefined,
    level: course.level as string | undefined,
    price: course.price as number | undefined,
    currency: (course.currency as string) || 'USD',
    rating: course.averageRating as number | undefined,
    reviewCount: course.reviewCount as number | undefined,
    enrollmentCount: course.enrollmentCount as number | undefined,
    duration: course.duration as number | undefined,
    instructor: instructor
      ? {
          id: String(instructor.id),
          name: (instructor.name as string) ||
            `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim(),
          avatar: instructor.avatar as string | undefined,
        }
      : undefined,
    isFree: !course.price || (course.price as number) === 0,
  };
}

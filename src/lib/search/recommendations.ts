// Personalized Course Recommendations
import { getPayload, Where } from 'payload';
import config from '@/payload.config';

export interface RecommendationContext {
  userId?: string;
  tenantId?: string;
  currentCourseId?: string;
  limit?: number;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  level?: string;
  price?: number;
  currency?: string;
  rating?: number;
  enrollmentCount?: number;
  instructor?: { id: string; name: string };
  recommendationScore: number;
  recommendationReason: string;
}

// Get personalized recommendations for a user
export async function getPersonalizedRecommendations(
  context: RecommendationContext
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });
  const { userId, tenantId, limit = 8 } = context;

  if (!userId) {
    return getPopularCourses(tenantId, limit);
  }

  const recommendations: RecommendedCourse[] = [];
  const addedIds = new Set<string>();

  // Get user's enrolled courses for context
  const enrollments = await payload.find({
    collection: 'enrollments',
    where: { user: { equals: userId } },
    depth: 2,
    limit: 50,
  });

  const enrolledCourseIds = new Set(
    enrollments.docs.map((e) =>
      typeof e.course === 'object' ? String(e.course.id) : String(e.course)
    )
  );

  // Extract user preferences from enrolled courses
  const categories: string[] = [];
  const levels: string[] = [];
  const instructorIds: string[] = [];

  for (const enrollment of enrollments.docs) {
    const course = enrollment.course;
    if (typeof course === 'object') {
      if (course.category) categories.push(String(course.category));
      if (course.level) levels.push(String(course.level));
      if (typeof course.instructor === 'object') {
        instructorIds.push(String(course.instructor.id));
      }
    }
  }

  // Find most common category
  const topCategory = getMostCommon(categories);
  const topLevel = getMostCommon(levels);

  // 1. Recommend courses from favorite instructors
  if (instructorIds.length > 0) {
    const uniqueInstructors = [...new Set(instructorIds)];
    const instructorCourses = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { status: { equals: 'published' } },
          { instructor: { in: uniqueInstructors } },
          ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
        ],
      },
      sort: '-averageRating',
      limit: 10,
    });

    for (const course of instructorCourses.docs) {
      if (!enrolledCourseIds.has(String(course.id)) && !addedIds.has(String(course.id))) {
        addedIds.add(String(course.id));
        recommendations.push(formatRecommendation(course, 90, 'From instructors you follow'));
      }
    }
  }

  // 2. Recommend courses in same category
  if (topCategory) {
    const categoryCourses = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { status: { equals: 'published' } },
          { category: { equals: topCategory } },
          ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
        ],
      },
      sort: '-enrollmentCount',
      limit: 10,
    });

    for (const course of categoryCourses.docs) {
      if (!enrolledCourseIds.has(String(course.id)) && !addedIds.has(String(course.id))) {
        addedIds.add(String(course.id));
        recommendations.push(
          formatRecommendation(course, 80, `Popular in ${topCategory}`)
        );
      }
    }
  }

  // 3. Recommend next-level courses
  if (topLevel === 'beginner') {
    const intermediateCourses = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { status: { equals: 'published' } },
          { level: { equals: 'intermediate' } },
          ...(topCategory ? [{ category: { equals: topCategory } }] : []),
          ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
        ],
      },
      sort: '-averageRating',
      limit: 5,
    });

    for (const course of intermediateCourses.docs) {
      if (!enrolledCourseIds.has(String(course.id)) && !addedIds.has(String(course.id))) {
        addedIds.add(String(course.id));
        recommendations.push(
          formatRecommendation(course, 75, 'Ready for the next level?')
        );
      }
    }
  } else if (topLevel === 'intermediate') {
    const advancedCourses = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { status: { equals: 'published' } },
          { level: { equals: 'advanced' } },
          ...(topCategory ? [{ category: { equals: topCategory } }] : []),
          ...(tenantId ? [{ tenant: { equals: tenantId } }] : []),
        ],
      },
      sort: '-averageRating',
      limit: 5,
    });

    for (const course of advancedCourses.docs) {
      if (!enrolledCourseIds.has(String(course.id)) && !addedIds.has(String(course.id))) {
        addedIds.add(String(course.id));
        recommendations.push(
          formatRecommendation(course, 75, 'Challenge yourself')
        );
      }
    }
  }

  // 4. Fill with popular courses if needed
  if (recommendations.length < limit) {
    const popularCourses = await getPopularCourses(
      tenantId,
      limit - recommendations.length,
      [...enrolledCourseIds, ...addedIds]
    );
    recommendations.push(...popularCourses);
  }

  // Sort by recommendation score and limit
  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

// Get courses similar to a specific course
export async function getSimilarCourses(
  courseId: string,
  tenantId?: string,
  limit: number = 6
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
    depth: 1,
  });

  if (!course) return [];

  const conditions: Where[] = [
    { status: { equals: 'published' } },
    { id: { not_equals: courseId } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  // Find courses with same category or level
  const similarConditions: Where = {
    and: [
      ...conditions,
      {
        or: [
          ...(course.category ? [{ category: { equals: course.category } }] : []),
          ...(course.level ? [{ level: { equals: course.level } }] : []),
        ],
      },
    ],
  };

  const similarCourses = await payload.find({
    collection: 'courses',
    where: similarConditions,
    sort: '-averageRating',
    limit: limit * 2,
  });

  // Score and rank similar courses
  const recommendations: RecommendedCourse[] = [];

  for (const similar of similarCourses.docs) {
    let score = 50;
    let reason = 'Similar course';

    // Same category boost
    if (similar.category === course.category) {
      score += 30;
      reason = `Also in ${course.category}`;
    }

    // Same level boost
    if (similar.level === course.level) {
      score += 10;
    }

    // Same instructor boost
    const courseInstructorId = typeof course.instructor === 'object'
      ? String(course.instructor.id)
      : String(course.instructor);
    const similarInstructorId = typeof similar.instructor === 'object'
      ? String(similar.instructor.id)
      : String(similar.instructor);

    if (courseInstructorId === similarInstructorId) {
      score += 20;
      reason = 'By the same instructor';
    }

    // High rating boost
    if ((similar.averageRating || 0) >= 4.5) {
      score += 10;
    }

    recommendations.push(formatRecommendation(similar, score, reason));
  }

  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

// Get trending courses
export async function getTrendingCourses(
  tenantId?: string,
  limit: number = 10
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  // Get courses with recent high enrollment activity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const conditions: Where[] = [
    { status: { equals: 'published' } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  // Get recent enrollments to find trending courses
  const recentEnrollments = await payload.find({
    collection: 'enrollments',
    where: {
      createdAt: { greater_than: thirtyDaysAgo.toISOString() },
    },
    limit: 1000,
  });

  // Count enrollments per course
  const enrollmentCounts: Record<string, number> = {};
  for (const enrollment of recentEnrollments.docs) {
    const courseId = typeof enrollment.course === 'object'
      ? String(enrollment.course.id)
      : String(enrollment.course);
    enrollmentCounts[courseId] = (enrollmentCounts[courseId] || 0) + 1;
  }

  // Get top trending course IDs
  const trendingIds = Object.entries(enrollmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (trendingIds.length === 0) {
    return getPopularCourses(tenantId, limit);
  }

  // Fetch course details
  const courses = await payload.find({
    collection: 'courses',
    where: {
      and: [
        { id: { in: trendingIds } },
        ...conditions,
      ],
    },
    limit,
  });

  return courses.docs.map((course) =>
    formatRecommendation(course, 85, 'Trending now')
  );
}

// Get new courses
export async function getNewCourses(
  tenantId?: string,
  limit: number = 8
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'published' } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  const newCourses = await payload.find({
    collection: 'courses',
    where: conditions.length > 1 ? { and: conditions } : conditions[0],
    sort: '-createdAt',
    limit,
  });

  return newCourses.docs.map((course) =>
    formatRecommendation(course, 70, 'Just added')
  );
}

// Get popular/top-rated courses
export async function getPopularCourses(
  tenantId?: string,
  limit: number = 10,
  excludeIds?: Set<string> | string[]
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'published' } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  const excludeSet = excludeIds instanceof Set ? excludeIds : new Set(excludeIds);
  if (excludeSet.size > 0) {
    conditions.push({ id: { not_in: Array.from(excludeSet) } });
  }

  const popularCourses = await payload.find({
    collection: 'courses',
    where: conditions.length > 1 ? { and: conditions } : conditions[0],
    sort: '-enrollmentCount',
    limit,
  });

  return popularCourses.docs.map((course) =>
    formatRecommendation(course, 60, 'Popular course')
  );
}

// Get courses by category
export async function getCoursesByCategory(
  category: string,
  tenantId?: string,
  limit: number = 12
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'published' } },
    { category: { equals: category } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  const courses = await payload.find({
    collection: 'courses',
    where: { and: conditions },
    sort: '-averageRating',
    limit,
  });

  return courses.docs.map((course) =>
    formatRecommendation(course, 65, category)
  );
}

// Get featured courses (manually curated or high performing)
export async function getFeaturedCourses(
  tenantId?: string,
  limit: number = 6
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  const conditions: Where[] = [
    { status: { equals: 'published' } },
    { averageRating: { greater_than_equal: 4.5 } },
    { enrollmentCount: { greater_than_equal: 100 } },
  ];

  if (tenantId) {
    conditions.push({ tenant: { equals: tenantId } });
  }

  const featuredCourses = await payload.find({
    collection: 'courses',
    where: { and: conditions },
    sort: '-averageRating,-enrollmentCount',
    limit,
  });

  return featuredCourses.docs.map((course) =>
    formatRecommendation(course, 95, 'Featured')
  );
}

// Get courses user hasn't finished (continue learning)
export async function getContinueLearning(
  userId: string,
  tenantId?: string,
  limit: number = 4
): Promise<RecommendedCourse[]> {
  const payload = await getPayload({ config });

  // Get enrollments with incomplete progress
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

  const recommendations: RecommendedCourse[] = [];

  for (const enrollment of enrollments.docs) {
    const course = enrollment.course;
    if (typeof course !== 'object') continue;

    // Check if course matches tenant
    if (tenantId && String(course.tenant) !== tenantId) continue;

    // Get progress for this enrollment
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

    // Only include courses with some but not complete progress
    if (progressPercent > 0 && progressPercent < 100) {
      recommendations.push({
        ...formatRecommendation(course, 100 - progressPercent, 'Continue learning'),
        recommendationReason: `${Math.round(progressPercent)}% complete - keep going!`,
      });
    }
  }

  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

// Helper: Format course as recommendation
function formatRecommendation(
  course: Record<string, unknown>,
  score: number,
  reason: string
): RecommendedCourse {
  const instructor = course.instructor as { id?: string; name?: string; firstName?: string; lastName?: string } | undefined;
  const instructorName = instructor?.name ||
    `${instructor?.firstName || ''} ${instructor?.lastName || ''}`.trim() ||
    undefined;

  return {
    id: String(course.id),
    title: String(course.title),
    slug: String(course.slug),
    description: course.shortDescription as string | undefined || course.description as string | undefined,
    thumbnail: typeof course.thumbnail === 'object'
      ? (course.thumbnail as { url?: string })?.url
      : course.thumbnail as string | undefined,
    category: course.category as string | undefined,
    level: course.level as string | undefined,
    price: course.price as number | undefined,
    currency: course.currency as string | undefined || 'USD',
    rating: course.averageRating as number | undefined,
    enrollmentCount: course.enrollmentCount as number | undefined,
    instructor: instructor
      ? { id: String(instructor.id), name: instructorName || 'Unknown' }
      : undefined,
    recommendationScore: score,
    recommendationReason: reason,
  };
}

// Helper: Get most common item in array
function getMostCommon<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;

  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  let maxCount = 0;
  let mostCommon: T | undefined;
  for (const [item, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = item;
    }
  }

  return mostCommon;
}

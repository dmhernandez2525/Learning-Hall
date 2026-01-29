import { getPayload, Where } from 'payload';
import config from '@/payload.config';

// Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  newEnrollments: number;
  completionRate: number;
  avgTimeOnPlatform: number;
  revenue: number;
  revenueGrowth: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: { date: string; count: number }[];
  weeklyActiveUsers: { date: string; count: number }[];
  monthlyActiveUsers: { date: string; count: number }[];
  avgSessionDuration: number;
  avgLessonsPerSession: number;
  avgQuizAttempts: number;
  videoEngagement: {
    totalViews: number;
    avgWatchTime: number;
    completionRate: number;
  };
  topContent: {
    id: string;
    title: string;
    views: number;
    avgEngagement: number;
  }[];
}

export interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface FunnelData {
  enrollment: FunnelStage[];
  learning: FunnelStage[];
  purchase: FunnelStage[];
}

export interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
  avgCompletionRate: number;
  avgRevenue: number;
}

export interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  avgEngagement: number;
  avgRevenue: number;
}

export interface LearningAnalytics {
  completionsByModule: { moduleId: string; title: string; completionRate: number }[];
  quizPerformance: {
    quizId: string;
    title: string;
    avgScore: number;
    passRate: number;
    attempts: number;
  }[];
  timeToComplete: {
    courseId: string;
    title: string;
    avgDays: number;
    medianDays: number;
  }[];
  dropoffPoints: {
    lessonId: string;
    title: string;
    dropoffRate: number;
    position: number;
  }[];
}

// Helper functions
function getDateRange(period: 'day' | 'week' | 'month' | 'quarter' | 'year'): DateRange {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

function getPreviousDateRange(range: DateRange): DateRange {
  const duration = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - duration),
    end: new Date(range.start.getTime()),
  };
}

// Build where clause with optional tenant filter
function buildWhere(tenantId: string | undefined, conditions: Where): Where {
  if (tenantId) {
    return { and: [{ tenant: { equals: tenantId } }, conditions] };
  }
  return conditions;
}

// Overview Metrics
export async function getOverviewMetrics(
  tenantId?: string,
  period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<OverviewMetrics> {
  const payload = await getPayload({ config });
  const dateRange = getDateRange(period);
  const previousRange = getPreviousDateRange(dateRange);

  // Total users
  const totalUsersResult = await payload.count({
    collection: 'users',
    where: tenantId ? { tenant: { equals: tenantId } } : undefined,
  });

  // Active users (logged in during period)
  const activeUsersResult = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'auth.login' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
    limit: 10000,
  });

  // Get unique user IDs from login events
  const activeUserIds = new Set(
    activeUsersResult.docs
      .map((event) => {
        const user = event.user;
        if (typeof user === 'object' && user !== null && 'id' in user) {
          return String(user.id);
        }
        return user ? String(user) : null;
      })
      .filter(Boolean)
  );

  // New users in period
  const newUsersResult = await payload.count({
    collection: 'users',
    where: buildWhere(tenantId, {
      createdAt: { greater_than_equal: dateRange.start.toISOString() },
    }),
  });

  // Total courses
  const totalCoursesResult = await payload.count({
    collection: 'courses',
    where: buildWhere(tenantId, { status: { equals: 'published' } }),
  });

  // Total enrollments
  const totalEnrollmentsResult = await payload.count({
    collection: 'enrollments',
    where: tenantId ? { tenant: { equals: tenantId } } : undefined,
  });

  // New enrollments in period
  const newEnrollmentsResult = await payload.count({
    collection: 'enrollments',
    where: buildWhere(tenantId, {
      createdAt: { greater_than_equal: dateRange.start.toISOString() },
    }),
  });

  // Completed enrollments for completion rate
  const completedEnrollmentsResult = await payload.count({
    collection: 'enrollments',
    where: buildWhere(tenantId, { status: { equals: 'completed' } }),
  });

  const completionRate =
    totalEnrollmentsResult.totalDocs > 0
      ? (completedEnrollmentsResult.totalDocs / totalEnrollmentsResult.totalDocs) * 100
      : 0;

  // Average time on platform (from session events)
  const sessionEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
      'properties.duration': { exists: true },
    }),
    limit: 1000,
  });

  const totalDuration = sessionEvents.docs.reduce((sum, event) => {
    const duration = event.properties?.duration;
    return sum + (typeof duration === 'number' ? duration : 0);
  }, 0);

  const avgTimeOnPlatform =
    sessionEvents.docs.length > 0 ? totalDuration / sessionEvents.docs.length : 0;

  // Revenue from checkout.complete events
  const revenueEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'checkout.complete' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
    limit: 10000,
  });

  const revenue = revenueEvents.docs.reduce((sum, event) => {
    const value = event.properties?.value;
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);

  // Previous period revenue for growth calculation
  const previousRevenueEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'checkout.complete' },
      timestamp: {
        greater_than_equal: previousRange.start.toISOString(),
        less_than: previousRange.end.toISOString(),
      },
    }),
    limit: 10000,
  });

  const previousRevenue = previousRevenueEvents.docs.reduce((sum, event) => {
    const value = event.properties?.value;
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);

  const revenueGrowth =
    previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

  return {
    totalUsers: totalUsersResult.totalDocs,
    activeUsers: activeUserIds.size,
    newUsers: newUsersResult.totalDocs,
    totalCourses: totalCoursesResult.totalDocs,
    totalEnrollments: totalEnrollmentsResult.totalDocs,
    newEnrollments: newEnrollmentsResult.totalDocs,
    completionRate: Math.round(completionRate * 10) / 10,
    avgTimeOnPlatform: Math.round(avgTimeOnPlatform),
    revenue: Math.round(revenue * 100) / 100,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
  };
}

// Helper to extract user ID as string
function extractUserId(user: unknown): string | null {
  if (!user) return null;
  if (typeof user === 'object' && user !== null && 'id' in user) {
    return String((user as { id: string | number }).id);
  }
  return String(user);
}

// Helper: Get week key from date
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// Engagement Metrics
export async function getEngagementMetrics(
  tenantId?: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<EngagementMetrics> {
  const payload = await getPayload({ config });
  const dateRange = getDateRange(period);

  // Daily/Weekly/Monthly active users
  const loginEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'auth.login' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
    limit: 10000,
  });

  // Group by day
  const dailyMap = new Map<string, Set<string>>();
  const weeklyMap = new Map<string, Set<string>>();
  const monthlyMap = new Map<string, Set<string>>();

  loginEvents.docs.forEach((event) => {
    const date = new Date(event.timestamp);
    const userId = extractUserId(event.user);
    if (!userId) return;

    const dayKey = date.toISOString().split('T')[0];
    const weekKey = getWeekKey(date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!dailyMap.has(dayKey)) dailyMap.set(dayKey, new Set());
    if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, new Set());
    if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, new Set());

    dailyMap.get(dayKey)!.add(userId);
    weeklyMap.get(weekKey)!.add(userId);
    monthlyMap.get(monthKey)!.add(userId);
  });

  const dailyActiveUsers = Array.from(dailyMap.entries())
    .map(([date, users]) => ({ date, count: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeklyActiveUsers = Array.from(weeklyMap.entries())
    .map(([date, users]) => ({ date, count: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthlyActiveUsers = Array.from(monthlyMap.entries())
    .map(([date, users]) => ({ date, count: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Session duration
  const sessionDurations = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
      'properties.duration': { exists: true },
    }),
    limit: 5000,
  });

  const durations = sessionDurations.docs
    .map((e) => e.properties?.duration)
    .filter((d): d is number => typeof d === 'number');

  const avgSessionDuration =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Lessons per session
  const lessonViews = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'lesson.view' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
  });

  const uniqueSessions = new Set(
    sessionDurations.docs.map((e) => e.sessionId).filter(Boolean)
  ).size;

  const avgLessonsPerSession =
    uniqueSessions > 0 ? lessonViews.totalDocs / uniqueSessions : 0;

  // Quiz attempts
  const quizAttempts = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'quiz.submit' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
  });

  const quizUserEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'quiz.submit' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
    limit: 5000,
  });

  const uniqueQuizUsers = new Set(
    quizUserEvents.docs.map((e) => extractUserId(e.user)).filter(Boolean)
  ).size;

  const avgQuizAttempts = uniqueQuizUsers > 0 ? quizAttempts.totalDocs / uniqueQuizUsers : 0;

  // Video engagement
  const videoPlays = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'video.play' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
  });

  const videoCompletes = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'video.complete' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
  });

  const videoWatchEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { in: ['video.play', 'video.pause', 'video.complete'] },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
      'properties.duration': { exists: true },
    }),
    limit: 5000,
  });

  const watchDurations = videoWatchEvents.docs
    .map((e) => e.properties?.duration)
    .filter((d): d is number => typeof d === 'number');

  const avgWatchTime =
    watchDurations.length > 0
      ? watchDurations.reduce((a, b) => a + b, 0) / watchDurations.length
      : 0;

  const videoCompletionRate =
    videoPlays.totalDocs > 0
      ? (videoCompletes.totalDocs / videoPlays.totalDocs) * 100
      : 0;

  // Top content
  const courseViews = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      eventType: { equals: 'course.view' },
      timestamp: { greater_than_equal: dateRange.start.toISOString() },
    }),
    limit: 10000,
  });

  const courseViewCounts = new Map<string, number>();
  courseViews.docs.forEach((event) => {
    const course = event.course;
    const courseId =
      typeof course === 'object' && course !== null && 'id' in course
        ? String((course as { id: string | number }).id)
        : course
          ? String(course)
          : null;
    if (courseId) {
      courseViewCounts.set(courseId, (courseViewCounts.get(courseId) || 0) + 1);
    }
  });

  const topCourseIds = Array.from(courseViewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const topCourses = await Promise.all(
    topCourseIds.map(async (id) => {
      try {
        const course = await payload.findByID({ collection: 'courses', id });
        return {
          id,
          title: course?.title || 'Unknown Course',
          views: courseViewCounts.get(id) || 0,
          avgEngagement: 0,
        };
      } catch {
        return {
          id,
          title: 'Unknown Course',
          views: courseViewCounts.get(id) || 0,
          avgEngagement: 0,
        };
      }
    })
  );

  return {
    dailyActiveUsers,
    weeklyActiveUsers,
    monthlyActiveUsers,
    avgSessionDuration: Math.round(avgSessionDuration),
    avgLessonsPerSession: Math.round(avgLessonsPerSession * 10) / 10,
    avgQuizAttempts: Math.round(avgQuizAttempts * 10) / 10,
    videoEngagement: {
      totalViews: videoPlays.totalDocs,
      avgWatchTime: Math.round(avgWatchTime),
      completionRate: Math.round(videoCompletionRate * 10) / 10,
    },
    topContent: topCourses,
  };
}

// Funnel Analysis
export async function getFunnelData(
  tenantId?: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<FunnelData> {
  const payload = await getPayload({ config });
  const dateRange = getDateRange(period);

  const dateCondition: Where = { timestamp: { greater_than_equal: dateRange.start.toISOString() } };

  // Enrollment funnel
  const courseViews = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'course.view' } }),
  });

  const checkoutStarts = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'checkout.start' } }),
  });

  const checkoutCompletes = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'checkout.complete' } }),
  });

  const enrollmentFunnel: FunnelStage[] = [
    {
      name: 'Course Views',
      count: courseViews.totalDocs,
      conversionRate: 100,
      dropoffRate: 0,
    },
    {
      name: 'Checkout Started',
      count: checkoutStarts.totalDocs,
      conversionRate:
        courseViews.totalDocs > 0
          ? (checkoutStarts.totalDocs / courseViews.totalDocs) * 100
          : 0,
      dropoffRate:
        courseViews.totalDocs > 0
          ? ((courseViews.totalDocs - checkoutStarts.totalDocs) / courseViews.totalDocs) * 100
          : 0,
    },
    {
      name: 'Purchase Complete',
      count: checkoutCompletes.totalDocs,
      conversionRate:
        courseViews.totalDocs > 0
          ? (checkoutCompletes.totalDocs / courseViews.totalDocs) * 100
          : 0,
      dropoffRate:
        checkoutStarts.totalDocs > 0
          ? ((checkoutStarts.totalDocs - checkoutCompletes.totalDocs) / checkoutStarts.totalDocs) *
            100
          : 0,
    },
  ];

  // Learning funnel
  const lessonStarts = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'lesson.start' } }),
  });

  const lessonCompletes = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'lesson.complete' } }),
  });

  const quizStarts = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'quiz.start' } }),
  });

  const quizCompletes = await payload.count({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { ...dateCondition, eventType: { equals: 'quiz.complete' } }),
  });

  const learningFunnel: FunnelStage[] = [
    {
      name: 'Lesson Started',
      count: lessonStarts.totalDocs,
      conversionRate: 100,
      dropoffRate: 0,
    },
    {
      name: 'Lesson Completed',
      count: lessonCompletes.totalDocs,
      conversionRate:
        lessonStarts.totalDocs > 0
          ? (lessonCompletes.totalDocs / lessonStarts.totalDocs) * 100
          : 0,
      dropoffRate:
        lessonStarts.totalDocs > 0
          ? ((lessonStarts.totalDocs - lessonCompletes.totalDocs) / lessonStarts.totalDocs) * 100
          : 0,
    },
    {
      name: 'Quiz Started',
      count: quizStarts.totalDocs,
      conversionRate:
        lessonStarts.totalDocs > 0 ? (quizStarts.totalDocs / lessonStarts.totalDocs) * 100 : 0,
      dropoffRate:
        lessonCompletes.totalDocs > 0
          ? ((lessonCompletes.totalDocs - quizStarts.totalDocs) / lessonCompletes.totalDocs) * 100
          : 0,
    },
    {
      name: 'Quiz Completed',
      count: quizCompletes.totalDocs,
      conversionRate:
        lessonStarts.totalDocs > 0 ? (quizCompletes.totalDocs / lessonStarts.totalDocs) * 100 : 0,
      dropoffRate:
        quizStarts.totalDocs > 0
          ? ((quizStarts.totalDocs - quizCompletes.totalDocs) / quizStarts.totalDocs) * 100
          : 0,
    },
  ];

  const purchaseFunnel = enrollmentFunnel;

  return {
    enrollment: enrollmentFunnel.map((s) => ({
      ...s,
      conversionRate: Math.round(s.conversionRate * 10) / 10,
      dropoffRate: Math.round(s.dropoffRate * 10) / 10,
    })),
    learning: learningFunnel.map((s) => ({
      ...s,
      conversionRate: Math.round(s.conversionRate * 10) / 10,
      dropoffRate: Math.round(s.dropoffRate * 10) / 10,
    })),
    purchase: purchaseFunnel.map((s) => ({
      ...s,
      conversionRate: Math.round(s.conversionRate * 10) / 10,
      dropoffRate: Math.round(s.dropoffRate * 10) / 10,
    })),
  };
}

// Cohort Analysis
export async function getCohortData(tenantId?: string, months: number = 6): Promise<CohortData[]> {
  const payload = await getPayload({ config });
  const cohorts: CohortData[] = [];

  for (let i = 0; i < months; i++) {
    const cohortStart = new Date();
    cohortStart.setMonth(cohortStart.getMonth() - i - 1);
    cohortStart.setDate(1);
    cohortStart.setHours(0, 0, 0, 0);

    const cohortEnd = new Date(cohortStart);
    cohortEnd.setMonth(cohortEnd.getMonth() + 1);

    // Users who registered in this cohort
    const cohortUsers = await payload.find({
      collection: 'users',
      where: buildWhere(tenantId, {
        createdAt: {
          greater_than_equal: cohortStart.toISOString(),
          less_than: cohortEnd.toISOString(),
        },
      }),
      limit: 10000,
    });

    if (cohortUsers.docs.length === 0) continue;

    const userIds = cohortUsers.docs.map((u) => String(u.id));

    // Calculate retention for each subsequent month
    const retention: number[] = [];
    for (let m = 0; m <= i; m++) {
      const retentionStart = new Date(cohortStart);
      retentionStart.setMonth(retentionStart.getMonth() + m);

      const retentionEnd = new Date(retentionStart);
      retentionEnd.setMonth(retentionEnd.getMonth() + 1);

      // Find users who had activity in this month
      const activeEvents = await payload.find({
        collection: 'analytics-events',
        where: buildWhere(tenantId, {
          user: { in: userIds },
          timestamp: {
            greater_than_equal: retentionStart.toISOString(),
            less_than: retentionEnd.toISOString(),
          },
        }),
        limit: 10000,
      });

      const activeUserIds = new Set(activeEvents.docs.map((e) => extractUserId(e.user)).filter(Boolean));

      const retentionRate = (activeUserIds.size / userIds.length) * 100;
      retention.push(Math.round(retentionRate * 10) / 10);
    }

    // Completion rate for cohort
    const completedEnrollments = await payload.count({
      collection: 'enrollments',
      where: buildWhere(tenantId, {
        user: { in: userIds },
        status: { equals: 'completed' },
      }),
    });

    const totalEnrollments = await payload.count({
      collection: 'enrollments',
      where: buildWhere(tenantId, { user: { in: userIds } }),
    });

    const avgCompletionRate =
      totalEnrollments.totalDocs > 0
        ? (completedEnrollments.totalDocs / totalEnrollments.totalDocs) * 100
        : 0;

    // Revenue for cohort
    const revenueEvents = await payload.find({
      collection: 'analytics-events',
      where: buildWhere(tenantId, {
        eventType: { equals: 'checkout.complete' },
        user: { in: userIds },
      }),
      limit: 10000,
    });

    const totalRevenue = revenueEvents.docs.reduce((sum, e) => {
      const value = e.properties?.value;
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);

    const avgRevenue = userIds.length > 0 ? totalRevenue / userIds.length : 0;

    cohorts.push({
      cohort: `${cohortStart.getFullYear()}-${String(cohortStart.getMonth() + 1).padStart(2, '0')}`,
      size: userIds.length,
      retention,
      avgCompletionRate: Math.round(avgCompletionRate * 10) / 10,
      avgRevenue: Math.round(avgRevenue * 100) / 100,
    });
  }

  return cohorts.reverse();
}

// User Segmentation
export async function getUserSegments(tenantId?: string): Promise<UserSegment[]> {
  const payload = await getPayload({ config });
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all users
  const allUsers = await payload.find({
    collection: 'users',
    where: tenantId ? { tenant: { equals: tenantId } } : undefined,
    limit: 10000,
  });

  if (allUsers.docs.length === 0) {
    return [];
  }

  // Get recent activity for all users
  const recentActivity = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, {
      timestamp: { greater_than_equal: thirtyDaysAgo.toISOString() },
    }),
    limit: 50000,
  });

  // Count activity per user
  const userActivity = new Map<string, number>();
  recentActivity.docs.forEach((event) => {
    const userId = extractUserId(event.user);
    if (userId) {
      userActivity.set(userId, (userActivity.get(userId) || 0) + 1);
    }
  });

  // Get enrollments per user
  const enrollments = await payload.find({
    collection: 'enrollments',
    where: tenantId ? { tenant: { equals: tenantId } } : undefined,
    limit: 50000,
  });

  enrollments.docs.forEach((e) => {
    const userId = extractUserId(e.user);
    if (userId) {
      // Just tracking that they have enrollments
    }
  });

  // Get revenue per user
  const revenueEvents = await payload.find({
    collection: 'analytics-events',
    where: buildWhere(tenantId, { eventType: { equals: 'checkout.complete' } }),
    limit: 50000,
  });

  const userRevenue = new Map<string, number>();
  revenueEvents.docs.forEach((event) => {
    const userId = extractUserId(event.user);
    const value = event.properties?.value;
    if (userId && typeof value === 'number') {
      userRevenue.set(userId, (userRevenue.get(userId) || 0) + value);
    }
  });

  // Segment users
  type SegmentDef = { users: string[]; minActivity?: number; maxActivity?: number };
  const segments: Record<string, SegmentDef> = {
    'Power Users': { users: [], minActivity: 50 },
    'Active Learners': { users: [], minActivity: 20, maxActivity: 50 },
    'Casual Users': { users: [], minActivity: 5, maxActivity: 20 },
    'At Risk': { users: [], minActivity: 1, maxActivity: 5 },
    Dormant: { users: [], maxActivity: 1 },
  };

  allUsers.docs.forEach((user) => {
    const activity = userActivity.get(String(user.id)) || 0;

    if (activity >= 50) {
      segments['Power Users'].users.push(String(user.id));
    } else if (activity >= 20) {
      segments['Active Learners'].users.push(String(user.id));
    } else if (activity >= 5) {
      segments['Casual Users'].users.push(String(user.id));
    } else if (activity >= 1) {
      segments['At Risk'].users.push(String(user.id));
    } else {
      segments['Dormant'].users.push(String(user.id));
    }
  });

  const totalUsers = allUsers.docs.length;

  return Object.entries(segments).map(([name, data]) => {
    const segmentUsers = data.users;
    const avgEngagement =
      segmentUsers.length > 0
        ? segmentUsers.reduce((sum, id) => sum + (userActivity.get(id) || 0), 0) / segmentUsers.length
        : 0;

    const avgRevenue =
      segmentUsers.length > 0
        ? segmentUsers.reduce((sum, id) => sum + (userRevenue.get(id) || 0), 0) / segmentUsers.length
        : 0;

    return {
      name,
      count: segmentUsers.length,
      percentage: Math.round((segmentUsers.length / totalUsers) * 1000) / 10,
      avgEngagement: Math.round(avgEngagement * 10) / 10,
      avgRevenue: Math.round(avgRevenue * 100) / 100,
    };
  });
}

// Learning Analytics
export async function getLearningAnalytics(
  tenantId?: string,
  courseId?: string
): Promise<LearningAnalytics> {
  const payload = await getPayload({ config });

  // Get modules for the course(s)
  const modules = await payload.find({
    collection: 'modules',
    where: courseId ? { course: { equals: courseId } } : undefined,
    limit: 100,
  });

  // Completion by module
  const completionsByModule = await Promise.all(
    modules.docs.map(async (mod) => {
      const lessons = await payload.find({
        collection: 'lessons',
        where: { module: { equals: String(mod.id) } },
        limit: 100,
      });

      if (lessons.docs.length === 0) {
        return {
          moduleId: String(mod.id),
          title: mod.title,
          completionRate: 0,
        };
      }

      const lessonIds = lessons.docs.map((l) => String(l.id));

      const completedLessons = await payload.count({
        collection: 'analytics-events',
        where: buildWhere(tenantId, {
          eventType: { equals: 'lesson.complete' },
          lesson: { in: lessonIds },
        }),
      });

      const startedLessons = await payload.count({
        collection: 'analytics-events',
        where: buildWhere(tenantId, {
          eventType: { equals: 'lesson.start' },
          lesson: { in: lessonIds },
        }),
      });

      const completionRate =
        startedLessons.totalDocs > 0
          ? (completedLessons.totalDocs / startedLessons.totalDocs) * 100
          : 0;

      return {
        moduleId: String(mod.id),
        title: mod.title,
        completionRate: Math.round(completionRate * 10) / 10,
      };
    })
  );

  // Quiz performance
  const quizzes = await payload.find({
    collection: 'quizzes',
    where: courseId ? { course: { equals: courseId } } : undefined,
    limit: 100,
  });

  const quizPerformance = await Promise.all(
    quizzes.docs.map(async (quiz) => {
      const quizSubmits = await payload.find({
        collection: 'analytics-events',
        where: buildWhere(tenantId, {
          eventType: { equals: 'quiz.submit' },
          quiz: { equals: String(quiz.id) },
        }),
        limit: 10000,
      });

      const scores = quizSubmits.docs
        .map((e) => e.properties?.score)
        .filter((s): s is number => typeof s === 'number');

      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      const passingScore = typeof quiz.passingScore === 'number' ? quiz.passingScore : 70;
      const passRate =
        scores.length > 0 ? (scores.filter((s) => s >= passingScore).length / scores.length) * 100 : 0;

      return {
        quizId: String(quiz.id),
        title: quiz.title,
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        attempts: quizSubmits.docs.length,
      };
    })
  );

  // Time to complete courses
  const courses = courseId
    ? [await payload.findByID({ collection: 'courses', id: courseId })]
    : (await payload.find({ collection: 'courses', where: tenantId ? { tenant: { equals: tenantId } } : undefined, limit: 50 })).docs;

  const timeToComplete = await Promise.all(
    courses.filter(Boolean).map(async (course) => {
      if (!course) return null;

      const completedEnrollments = await payload.find({
        collection: 'enrollments',
        where: buildWhere(tenantId, {
          course: { equals: String(course.id) },
          status: { equals: 'completed' },
        }),
        limit: 1000,
      });

      const completionDays = completedEnrollments.docs
        .map((e) => {
          if (!e.createdAt || !e.updatedAt) return null;
          const start = new Date(e.createdAt);
          const end = new Date(e.updatedAt);
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        })
        .filter((d): d is number => d !== null);

      const avgDays =
        completionDays.length > 0 ? completionDays.reduce((a, b) => a + b, 0) / completionDays.length : 0;

      const sortedDays = [...completionDays].sort((a, b) => a - b);
      const medianDays = sortedDays.length > 0 ? sortedDays[Math.floor(sortedDays.length / 2)] : 0;

      return {
        courseId: String(course.id),
        title: course.title,
        avgDays: Math.round(avgDays * 10) / 10,
        medianDays: Math.round(medianDays * 10) / 10,
      };
    })
  );

  // Dropoff points
  const lessons = courseId
    ? await payload.find({
        collection: 'lessons',
        where: { module: { in: modules.docs.map((m) => String(m.id)) } },
        limit: 200,
      })
    : await payload.find({
        collection: 'lessons',
        limit: 200,
      });

  const dropoffPoints = await Promise.all(
    lessons.docs.slice(0, 20).map(async (lesson, index) => {
      const starts = await payload.count({
        collection: 'analytics-events',
        where: buildWhere(tenantId, {
          eventType: { equals: 'lesson.start' },
          lesson: { equals: String(lesson.id) },
        }),
      });

      const completes = await payload.count({
        collection: 'analytics-events',
        where: buildWhere(tenantId, {
          eventType: { equals: 'lesson.complete' },
          lesson: { equals: String(lesson.id) },
        }),
      });

      const dropoffRate =
        starts.totalDocs > 0 ? ((starts.totalDocs - completes.totalDocs) / starts.totalDocs) * 100 : 0;

      return {
        lessonId: String(lesson.id),
        title: lesson.title,
        dropoffRate: Math.round(dropoffRate * 10) / 10,
        position: index + 1,
      };
    })
  );

  // Sort by dropoff rate and return top offenders
  const sortedDropoffs = dropoffPoints.sort((a, b) => b.dropoffRate - a.dropoffRate).slice(0, 10);

  return {
    completionsByModule,
    quizPerformance,
    timeToComplete: timeToComplete.filter((t): t is NonNullable<typeof t> => t !== null),
    dropoffPoints: sortedDropoffs,
  };
}

// Track analytics event
export async function trackEvent(
  eventType: string,
  data: {
    userId?: string;
    sessionId?: string;
    courseId?: string;
    lessonId?: string;
    quizId?: string;
    tenantId?: string;
    metadata?: Record<string, unknown>;
    properties?: {
      duration?: number;
      progress?: number;
      score?: number;
      value?: number;
      query?: string;
      errorMessage?: string;
    };
    context?: {
      url?: string;
      referrer?: string;
      userAgent?: string;
      ip?: string;
      country?: string;
      device?: 'desktop' | 'mobile' | 'tablet';
      browser?: string;
      os?: string;
    };
  }
): Promise<void> {
  const payload = await getPayload({ config });

  await payload.create({
    collection: 'analytics-events',
    data: {
      eventType: eventType as
        | 'page.view'
        | 'course.view'
        | 'lesson.view'
        | 'video.play'
        | 'video.pause'
        | 'video.complete'
        | 'video.seek'
        | 'lesson.start'
        | 'lesson.complete'
        | 'quiz.start'
        | 'quiz.submit'
        | 'quiz.complete'
        | 'discussion.post'
        | 'discussion.reply'
        | 'note.create'
        | 'bookmark.add'
        | 'checkout.start'
        | 'checkout.complete'
        | 'checkout.abandon'
        | 'auth.login'
        | 'auth.logout'
        | 'auth.register'
        | 'search.query'
        | 'error.occurred',
      user: data.userId,
      sessionId: data.sessionId,
      course: data.courseId,
      lesson: data.lessonId,
      quiz: data.quizId,
      tenant: data.tenantId,
      metadata: data.metadata,
      properties: data.properties,
      context: data.context,
      timestamp: new Date().toISOString(),
    },
  });
}

// Export event for client-side tracking
export async function trackClientEvent(
  request: Request,
  eventType: string,
  data: Omit<Parameters<typeof trackEvent>[1], 'context'>
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const device: 'desktop' | 'mobile' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  await trackEvent(eventType, {
    ...data,
    context: {
      userAgent,
      referrer: referer,
      ip,
      device,
    },
  });
}

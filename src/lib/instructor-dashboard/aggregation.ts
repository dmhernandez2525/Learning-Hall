import {
  type CoursePerformanceMetric,
  type DashboardCourseRecord,
  type DashboardDateRange,
  type DashboardEnrollmentRecord,
  type DashboardLessonActivityRecord,
  type DashboardQuizAttemptRecord,
  type DashboardRevenueRecord,
  type DashboardReviewRecord,
  type EnrollmentNotification,
  type InstructorDashboardData,
  type RevenueSlice,
} from './types';
import { buildInsights, getQuickActions } from './insights';
import { average, buildRatingTrend, buildTimeline, ratio, roundTo } from './timeline';

interface BuildInstructorDashboardInput {
  dateRange: DashboardDateRange;
  courses: DashboardCourseRecord[];
  enrollments: DashboardEnrollmentRecord[];
  revenue: DashboardRevenueRecord[];
  quizAttempts: DashboardQuizAttemptRecord[];
  lessonActivity: DashboardLessonActivityRecord[];
  reviews: DashboardReviewRecord[];
  notifications: EnrollmentNotification[];
  generatedAt?: string;
}

function buildCoursePerformance(input: BuildInstructorDashboardInput): CoursePerformanceMetric[] {
  return input.courses.map((course) => {
    const enrollments = input.enrollments.filter((entry) => entry.courseId === course.id);
    const completions = enrollments.filter((entry) => entry.status === 'completed').length;
    const learners = new Set(enrollments.map((entry) => entry.userId));

    const quizScores = input.quizAttempts
      .filter((entry) => entry.courseId === course.id)
      .map((entry) => entry.percentage);

    const totalSeconds = input.lessonActivity
      .filter((entry) => entry.courseId === course.id)
      .reduce((sum, entry) => sum + entry.lastPositionSeconds, 0);

    const revenueCents = input.revenue
      .filter((entry) => entry.courseId === course.id)
      .reduce((sum, entry) => sum + entry.amountCents, 0);

    const reviewValues = input.reviews
      .filter((entry) => entry.courseId === course.id)
      .map((entry) => entry.rating);

    return {
      courseId: course.id,
      title: course.title,
      status: course.status,
      enrollments: enrollments.length,
      completions,
      completionRate: ratio(completions, enrollments.length),
      averageTimeSpentMinutes: learners.size > 0 ? roundTo(totalSeconds / learners.size / 60) : 0,
      averageQuizScore: roundTo(average(quizScores)),
      revenueCents,
      averageRating: roundTo(
        reviewValues.length > 0 ? average(reviewValues) : course.averageRating,
        2
      ),
    };
  });
}

function buildRevenueByCourse(metrics: CoursePerformanceMetric[]): RevenueSlice[] {
  const totalRevenue = metrics.reduce((sum, entry) => sum + entry.revenueCents, 0);

  return metrics
    .filter((entry) => entry.revenueCents > 0)
    .map((entry) => ({
      courseId: entry.courseId,
      title: entry.title,
      revenueCents: entry.revenueCents,
      sharePercent: ratio(entry.revenueCents, totalRevenue),
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

export function buildInstructorDashboardData(input: BuildInstructorDashboardInput): InstructorDashboardData {
  const coursePerformance = buildCoursePerformance(input).sort((a, b) => b.revenueCents - a.revenueCents);
  const revenueByCourse = buildRevenueByCourse(coursePerformance);

  const totalEnrollments = input.enrollments.length;
  const completedEnrollments = input.enrollments.filter((entry) => entry.status === 'completed').length;
  const learnerIds = new Set(input.enrollments.map((entry) => entry.userId));
  const totalActivitySeconds = input.lessonActivity.reduce(
    (sum, entry) => sum + entry.lastPositionSeconds,
    0
  );

  const totals = {
    totalCourses: input.courses.length,
    totalEnrollments,
    completedEnrollments,
    completionRate: ratio(completedEnrollments, totalEnrollments),
    averageTimeSpentMinutes: learnerIds.size > 0 ? roundTo(totalActivitySeconds / learnerIds.size / 60) : 0,
    averageQuizScore: roundTo(average(input.quizAttempts.map((entry) => entry.percentage))),
    totalRevenueCents: input.revenue.reduce((sum, entry) => sum + entry.amountCents, 0),
    averageRating: roundTo(average(coursePerformance.map((entry) => entry.averageRating))),
  };

  const sortedNotifications = [...input.notifications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return {
    dateRange: input.dateRange,
    totals,
    enrollmentsTimeline: buildTimeline(
      input.dateRange,
      input.enrollments.map((entry) => ({ createdAt: entry.createdAt, value: 1 }))
    ),
    revenueTimeline: buildTimeline(
      input.dateRange,
      input.revenue.map((entry) => ({ createdAt: entry.createdAt, value: entry.amountCents / 100 }))
    ),
    revenueByCourse,
    ratingTrend: buildRatingTrend(input.dateRange, input.reviews),
    coursePerformance,
    quickActions: getQuickActions(),
    insights: buildInsights(totals, coursePerformance, revenueByCourse),
    notifications: sortedNotifications,
    notificationsCursor: sortedNotifications[0]?.createdAt ?? input.generatedAt ?? new Date().toISOString(),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}

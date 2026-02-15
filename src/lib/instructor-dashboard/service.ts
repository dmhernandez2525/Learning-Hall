import { getPayload, type Where } from 'payload';
import config from '@/payload.config';
import { buildInstructorDashboardData } from './aggregation';
import { resolveDashboardDateRange } from './date-range';
import {
  mapCourseRecord,
  mapEnrollmentNotification,
  mapEnrollmentRecord,
  mapLessonActivityRecord,
  mapQuizAttemptRecord,
  mapRevenueRecords,
  mapReviewRecord,
} from './mappers';
import type {
  DashboardCourseRecord,
  EnrollmentNotificationQuery,
  EnrollmentNotificationResponse,
  InstructorDashboardData,
  InstructorDashboardQuery,
} from './types';

const MAX_QUERY_LIMIT = 10000;
const DEFAULT_NOTIFICATION_LIMIT = 12;

function toUniqueCourseIds(courses: DashboardCourseRecord[]): string[] {
  return [...new Set(courses.map((course) => course.id))];
}

function createCreatedAtRangeFilters(start: string, end: string): Where[] {
  return [
    { createdAt: { greater_than_equal: start } },
    { createdAt: { less_than_equal: end } },
  ];
}

async function fetchInstructorCourses(instructorId: string): Promise<DashboardCourseRecord[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'courses',
    where: { instructor: { equals: instructorId } },
    depth: 0,
    limit: 500,
  });

  return result.docs
    .map((doc) => mapCourseRecord(doc))
    .filter((course): course is DashboardCourseRecord => course !== null);
}

async function fetchQuizCourseMap(courseIds: string[]): Promise<Map<string, string>> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'quizzes',
    where: { course: { in: courseIds } },
    depth: 0,
    limit: MAX_QUERY_LIMIT,
  });

  const map = new Map<string, string>();
  result.docs.forEach((doc) => {
    const courseValue = doc.course;
    const courseId = typeof courseValue === 'string' || typeof courseValue === 'number'
      ? String(courseValue)
      : typeof courseValue === 'object' && courseValue !== null && 'id' in courseValue
        ? String((courseValue as { id: string | number }).id)
        : '';
    const quizId = typeof doc.id === 'string' || typeof doc.id === 'number' ? String(doc.id) : '';
    if (!quizId || !courseId) {
      return;
    }

    map.set(quizId, courseId);
  });

  return map;
}

export async function getInstructorEnrollmentNotifications(
  query: EnrollmentNotificationQuery
): Promise<EnrollmentNotificationResponse> {
  const payload = await getPayload({ config });
  const courses = await fetchInstructorCourses(query.instructorId);
  const courseIds = toUniqueCourseIds(courses);
  const now = new Date().toISOString();

  if (courseIds.length === 0) {
    return { notifications: [], cursor: now };
  }

  const conditions: Where[] = [{ course: { in: courseIds } }];
  if (query.since) {
    conditions.push({ createdAt: { greater_than: query.since } });
  }

  const result = await payload.find({
    collection: 'enrollments',
    where: { and: conditions },
    sort: '-createdAt',
    depth: 2,
    limit: query.limit ?? DEFAULT_NOTIFICATION_LIMIT,
  });

  const notifications = result.docs
    .map((doc) => mapEnrollmentNotification(doc, now))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    notifications,
    cursor: notifications[0]?.createdAt ?? query.since ?? now,
  };
}

export async function getInstructorDashboardData(
  query: InstructorDashboardQuery
): Promise<InstructorDashboardData> {
  const payload = await getPayload({ config });
  const now = new Date();
  const nowIso = now.toISOString();
  const dateRange = resolveDashboardDateRange(query.rangeKey, now);
  const courses = await fetchInstructorCourses(query.instructorId);
  const courseIds = toUniqueCourseIds(courses);

  if (courseIds.length === 0) {
    return buildInstructorDashboardData({
      dateRange,
      courses: [],
      enrollments: [],
      revenue: [],
      quizAttempts: [],
      lessonActivity: [],
      reviews: [],
      notifications: [],
      generatedAt: nowIso,
    });
  }

  const createdAtRangeFilters = createCreatedAtRangeFilters(dateRange.start, dateRange.end);

  const [enrollmentResult, paymentResult, lessonActivityResult, reviewResult, notifications] =
    await Promise.all([
      payload.find({
        collection: 'enrollments',
        where: { and: [{ course: { in: courseIds } }, ...createdAtRangeFilters] },
        depth: 0,
        limit: MAX_QUERY_LIMIT,
      }),
      payload.find({
        collection: 'payments',
        where: {
          and: [
            { status: { equals: 'succeeded' } },
            { type: { in: ['course_purchase', 'bundle_purchase'] } },
            ...createdAtRangeFilters,
          ],
        },
        depth: 0,
        limit: MAX_QUERY_LIMIT,
      }),
      payload.find({
        collection: 'lesson-activity',
        where: {
          and: [
            { course: { in: courseIds } },
            { lastViewedAt: { greater_than_equal: dateRange.start } },
            { lastViewedAt: { less_than_equal: dateRange.end } },
          ],
        },
        depth: 0,
        limit: MAX_QUERY_LIMIT,
      }),
      payload.find({
        collection: 'course-reviews',
        where: {
          and: [
            { status: { equals: 'approved' } },
            { course: { in: courseIds } },
            ...createdAtRangeFilters,
          ],
        },
        depth: 0,
        limit: MAX_QUERY_LIMIT,
      }),
      getInstructorEnrollmentNotifications({
        instructorId: query.instructorId,
        since: query.notificationsSince,
        limit: DEFAULT_NOTIFICATION_LIMIT,
      }).then((result) => result.notifications),
    ]);

  const quizToCourse = await fetchQuizCourseMap(courseIds);
  const quizIds = [...quizToCourse.keys()];

  const quizAttemptResult = quizIds.length > 0
    ? await payload.find({
      collection: 'quiz-attempts',
      where: {
        and: [
          { quiz: { in: quizIds } },
          { status: { in: ['completed', 'timedOut'] } },
          ...createdAtRangeFilters,
        ],
      },
      depth: 0,
      limit: MAX_QUERY_LIMIT,
    })
    : { docs: [] };

  const courseIdSet = new Set(courseIds);
  const enrollments = enrollmentResult.docs
    .map((doc) => mapEnrollmentRecord(doc, nowIso))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const revenue = paymentResult.docs.flatMap((doc) => mapRevenueRecords(doc, courseIdSet, nowIso));
  const lessonActivity = lessonActivityResult.docs
    .map((doc) => mapLessonActivityRecord(doc, nowIso))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const reviews = reviewResult.docs
    .map((doc) => mapReviewRecord(doc, nowIso))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const quizAttempts = quizAttemptResult.docs
    .map((doc) => mapQuizAttemptRecord(doc, quizToCourse, nowIso))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return buildInstructorDashboardData({
    dateRange,
    courses,
    enrollments,
    revenue,
    quizAttempts,
    lessonActivity,
    reviews,
    notifications,
    generatedAt: nowIso,
  });
}

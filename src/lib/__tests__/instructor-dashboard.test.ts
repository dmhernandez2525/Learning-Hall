import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInstructorDashboardData } from '../instructor-dashboard/aggregation';
import { getInstructorEnrollmentNotifications } from '../instructor-dashboard/service';
import type { DashboardDateRange } from '../instructor-dashboard/types';

const mockFind = vi.fn();

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>();
  return {
    ...actual,
    getPayload: vi.fn(async () => ({
      find: mockFind,
    })),
  };
});

describe('Instructor dashboard aggregation', () => {
  it('calculates summary metrics and course performance', () => {
    const dateRange: DashboardDateRange = {
      key: '30d',
      label: 'Last 30 days',
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-01-30T23:59:59.000Z',
    };

    const result = buildInstructorDashboardData({
      dateRange,
      courses: [
        { id: 'course-1', title: 'Course One', status: 'published', averageRating: 4.2 },
        { id: 'course-2', title: 'Course Two', status: 'draft', averageRating: 3.6 },
      ],
      enrollments: [
        {
          id: 'enroll-1',
          courseId: 'course-1',
          userId: 'user-1',
          status: 'active',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
        {
          id: 'enroll-2',
          courseId: 'course-1',
          userId: 'user-2',
          status: 'completed',
          createdAt: '2026-01-05T10:00:00.000Z',
        },
        {
          id: 'enroll-3',
          courseId: 'course-2',
          userId: 'user-3',
          status: 'active',
          createdAt: '2026-01-11T10:00:00.000Z',
        },
      ],
      revenue: [
        { courseId: 'course-1', amountCents: 10000, createdAt: '2026-01-03T10:00:00.000Z' },
        { courseId: 'course-2', amountCents: 5000, createdAt: '2026-01-09T10:00:00.000Z' },
      ],
      quizAttempts: [
        {
          id: 'attempt-1',
          courseId: 'course-1',
          percentage: 80,
          durationSeconds: 500,
          createdAt: '2026-01-04T10:00:00.000Z',
        },
        {
          id: 'attempt-2',
          courseId: 'course-1',
          percentage: 60,
          durationSeconds: 450,
          createdAt: '2026-01-08T10:00:00.000Z',
        },
        {
          id: 'attempt-3',
          courseId: 'course-2',
          percentage: 90,
          durationSeconds: 300,
          createdAt: '2026-01-10T10:00:00.000Z',
        },
      ],
      lessonActivity: [
        {
          id: 'activity-1',
          courseId: 'course-1',
          userId: 'user-1',
          lastPositionSeconds: 1200,
          lastViewedAt: '2026-01-02T11:00:00.000Z',
        },
        {
          id: 'activity-2',
          courseId: 'course-1',
          userId: 'user-2',
          lastPositionSeconds: 600,
          lastViewedAt: '2026-01-05T11:00:00.000Z',
        },
        {
          id: 'activity-3',
          courseId: 'course-2',
          userId: 'user-3',
          lastPositionSeconds: 300,
          lastViewedAt: '2026-01-11T11:00:00.000Z',
        },
      ],
      reviews: [
        { id: 'review-1', courseId: 'course-1', rating: 5, createdAt: '2026-01-06T09:00:00.000Z' },
        { id: 'review-2', courseId: 'course-1', rating: 4, createdAt: '2026-01-13T09:00:00.000Z' },
        { id: 'review-3', courseId: 'course-2', rating: 3, createdAt: '2026-01-15T09:00:00.000Z' },
      ],
      notifications: [],
      generatedAt: '2026-01-30T23:59:59.000Z',
    });

    expect(result.totals.totalCourses).toBe(2);
    expect(result.totals.totalEnrollments).toBe(3);
    expect(result.totals.completedEnrollments).toBe(1);
    expect(result.totals.completionRate).toBe(33.3);
    expect(result.totals.averageQuizScore).toBe(76.7);
    expect(result.totals.totalRevenueCents).toBe(15000);
    expect(result.totals.averageTimeSpentMinutes).toBe(11.7);
    expect(result.totals.averageRating).toBe(3.8);
    expect(result.coursePerformance[0].courseId).toBe('course-1');
    expect(result.revenueByCourse[0].sharePercent).toBe(66.7);
  });
});

describe('Instructor dashboard notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sorted enrollment notifications with cursor for polling', async () => {
    mockFind.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'courses') {
        return {
          docs: [{ id: 'course-1', title: 'Analytics 101', status: 'published' }],
        };
      }

      if (collection === 'enrollments') {
        return {
          docs: [
            {
              id: 'enroll-2',
              createdAt: '2026-01-18T14:00:00.000Z',
              course: { id: 'course-1', title: 'Analytics 101' },
              user: { id: 'user-2', name: 'Taylor', email: 'taylor@example.com' },
            },
            {
              id: 'enroll-1',
              createdAt: '2026-01-17T14:00:00.000Z',
              course: { id: 'course-1', title: 'Analytics 101' },
              user: { id: 'user-1', name: 'Morgan', email: 'morgan@example.com' },
            },
          ],
        };
      }

      return { docs: [] };
    });

    const result = await getInstructorEnrollmentNotifications({
      instructorId: 'instructor-1',
      since: '2026-01-16T00:00:00.000Z',
      limit: 10,
    });

    expect(result.notifications).toHaveLength(2);
    expect(result.notifications[0].enrollmentId).toBe('enroll-2');
    expect(result.notifications[0].studentName).toBe('Taylor');
    expect(result.cursor).toBe('2026-01-18T14:00:00.000Z');
  });
});

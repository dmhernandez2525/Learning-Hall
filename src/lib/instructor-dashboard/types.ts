export type DashboardRangeKey = '7d' | '30d' | '90d' | '365d';

export interface DashboardDateRange {
  key: DashboardRangeKey;
  label: string;
  start: string;
  end: string;
}

export interface DashboardCourseRecord {
  id: string;
  title: string;
  status: string;
  averageRating: number;
}

export interface DashboardEnrollmentRecord {
  id: string;
  courseId: string;
  userId: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
}

export interface DashboardRevenueRecord {
  courseId: string;
  amountCents: number;
  createdAt: string;
}

export interface DashboardQuizAttemptRecord {
  id: string;
  courseId: string;
  percentage: number;
  durationSeconds: number;
  createdAt: string;
}

export interface DashboardLessonActivityRecord {
  id: string;
  courseId: string;
  userId: string;
  lastPositionSeconds: number;
  lastViewedAt: string;
}

export interface DashboardReviewRecord {
  id: string;
  courseId: string;
  rating: number;
  createdAt: string;
}

export interface DashboardTimelinePoint {
  isoDate: string;
  label: string;
  value: number;
}

export interface CoursePerformanceMetric {
  courseId: string;
  title: string;
  status: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageTimeSpentMinutes: number;
  averageQuizScore: number;
  revenueCents: number;
  averageRating: number;
}

export interface RevenueSlice {
  courseId: string;
  title: string;
  revenueCents: number;
  sharePercent: number;
}

export interface RatingTrendPoint {
  isoDate: string;
  label: string;
  averageRating: number;
  rollingAverage: number;
  reviewCount: number;
}

export interface EnrollmentNotification {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  createdAt: string;
}

export interface DashboardInsight {
  id: string;
  severity: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  description: string;
  type: 'link' | 'export';
  href?: string;
}

export interface InstructorDashboardTotals {
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageTimeSpentMinutes: number;
  averageQuizScore: number;
  totalRevenueCents: number;
  averageRating: number;
}

export interface InstructorDashboardData {
  dateRange: DashboardDateRange;
  totals: InstructorDashboardTotals;
  enrollmentsTimeline: DashboardTimelinePoint[];
  revenueTimeline: DashboardTimelinePoint[];
  revenueByCourse: RevenueSlice[];
  ratingTrend: RatingTrendPoint[];
  coursePerformance: CoursePerformanceMetric[];
  quickActions: DashboardQuickAction[];
  insights: DashboardInsight[];
  notifications: EnrollmentNotification[];
  notificationsCursor: string;
  generatedAt: string;
}

export interface InstructorDashboardQuery {
  instructorId: string;
  rangeKey: DashboardRangeKey;
  notificationsSince?: string;
}

export interface EnrollmentNotificationQuery {
  instructorId: string;
  since?: string;
  limit?: number;
}

export interface EnrollmentNotificationResponse {
  notifications: EnrollmentNotification[];
  cursor: string;
}


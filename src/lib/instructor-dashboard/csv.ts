import type { InstructorDashboardData } from './types';

function escapeCsv(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function pushSection(
  lines: string[],
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  lines.push(title);
  lines.push(headers.map(escapeCsv).join(','));
  rows.forEach((row) => {
    lines.push(row.map(escapeCsv).join(','));
  });
  lines.push('');
}

function formatDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function buildInstructorDashboardCsv(data: InstructorDashboardData): string {
  const lines: string[] = [];

  pushSection(
    lines,
    'Overview Metrics',
    ['Range', 'Courses', 'Enrollments', 'Completions', 'Completion Rate', 'Avg Quiz', 'Avg Time (min)', 'Revenue ($)', 'Avg Rating'],
    [[
      data.dateRange.label,
      data.totals.totalCourses,
      data.totals.totalEnrollments,
      data.totals.completedEnrollments,
      `${data.totals.completionRate}%`,
      `${data.totals.averageQuizScore}%`,
      data.totals.averageTimeSpentMinutes,
      formatDollars(data.totals.totalRevenueCents),
      data.totals.averageRating,
    ]]
  );

  pushSection(
    lines,
    'Course Performance',
    ['Course', 'Status', 'Enrollments', 'Completions', 'Completion Rate', 'Avg Quiz', 'Avg Time (min)', 'Revenue ($)', 'Rating'],
    data.coursePerformance.map((course) => [
      course.title,
      course.status,
      course.enrollments,
      course.completions,
      `${course.completionRate}%`,
      `${course.averageQuizScore}%`,
      course.averageTimeSpentMinutes,
      formatDollars(course.revenueCents),
      course.averageRating,
    ])
  );

  pushSection(
    lines,
    'Enrollment Timeline',
    ['Date', 'Enrollments'],
    data.enrollmentsTimeline.map((point) => [point.label, point.value])
  );

  pushSection(
    lines,
    'Revenue Timeline',
    ['Date', 'Revenue ($)'],
    data.revenueTimeline.map((point) => [point.label, point.value])
  );

  pushSection(
    lines,
    'Rating Trend',
    ['Date', 'Average Rating', 'Rolling Average', 'Review Count'],
    data.ratingTrend.map((point) => [
      point.label,
      point.averageRating,
      point.rollingAverage,
      point.reviewCount,
    ])
  );

  pushSection(
    lines,
    'Notifications',
    ['Timestamp', 'Course', 'Student', 'Email'],
    data.notifications.map((entry) => [
      entry.createdAt,
      entry.courseTitle,
      entry.studentName,
      entry.studentEmail,
    ])
  );

  return lines.join('\n').trim();
}


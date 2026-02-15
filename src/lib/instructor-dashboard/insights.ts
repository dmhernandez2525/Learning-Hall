import type {
  CoursePerformanceMetric,
  DashboardInsight,
  DashboardQuickAction,
  InstructorDashboardData,
  RevenueSlice,
} from './types';

export function getQuickActions(): DashboardQuickAction[] {
  return [
    {
      id: 'action-create-course',
      label: 'Create Course',
      description: 'Start building a new learning experience.',
      type: 'link',
      href: '/dashboard/courses/new',
    },
    {
      id: 'action-manage-enrollments',
      label: 'Manage Enrollments',
      description: 'Review learner status and progress.',
      type: 'link',
      href: '/enrollments',
    },
    {
      id: 'action-view-messages',
      label: 'View Messages',
      description: 'Open course discussion threads from the admin panel.',
      type: 'link',
      href: '/admin/collections/discussion-threads',
    },
    {
      id: 'action-export-data',
      label: 'Export Data',
      description: 'Download dashboard data as CSV.',
      type: 'export',
    },
  ];
}

export function buildInsights(
  totals: InstructorDashboardData['totals'],
  coursePerformance: CoursePerformanceMetric[],
  revenueByCourse: RevenueSlice[]
): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  if (totals.totalEnrollments === 0) {
    insights.push({
      id: 'insight-empty-enrollments',
      severity: 'info',
      title: 'No enrollments in this range',
      description: 'Promote your published courses to drive first-time learner acquisition.',
      actionLabel: 'View Courses',
      actionHref: '/dashboard/courses',
    });
  } else if (totals.completionRate < 60) {
    insights.push({
      id: 'insight-completion-risk',
      severity: 'warning',
      title: 'Completion rate needs attention',
      description: 'Add checkpoints and short quizzes to keep learners engaged through completion.',
      actionLabel: 'Review Course Builder',
      actionHref: '/dashboard/courses',
    });
  }

  if (totals.averageQuizScore > 0 && totals.averageQuizScore < 70) {
    insights.push({
      id: 'insight-quiz-score',
      severity: 'warning',
      title: 'Quiz scores are trending low',
      description: 'Revisit difficult lessons and clarify prerequisites before advanced assessments.',
    });
  }

  if (revenueByCourse.length > 0 && revenueByCourse[0].sharePercent > 60) {
    insights.push({
      id: 'insight-revenue-concentration',
      severity: 'info',
      title: 'Revenue is concentrated in one course',
      description: `Top course contributes ${revenueByCourse[0].sharePercent}% of range revenue.`,
    });
  }

  const highPerformingCourses = coursePerformance.filter(
    (course) => course.completionRate >= 80 && course.averageRating >= 4
  );

  if (highPerformingCourses.length > 0) {
    insights.push({
      id: 'insight-high-performing',
      severity: 'success',
      title: 'High-performing course detected',
      description: `${highPerformingCourses[0].title} is leading in completion and learner sentiment.`,
    });
  }

  return insights.slice(0, 4);
}


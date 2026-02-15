'use client';

import { BookOpen, CircleDollarSign, ClipboardCheck, Clock3, Star, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InstructorDashboardTotals } from '@/lib/instructor-dashboard/types';

interface DashboardStatsGridProps {
  totals: InstructorDashboardTotals;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function DashboardStatsGrid({ totals }: DashboardStatsGridProps) {
  const stats = [
    {
      label: 'Courses',
      value: totals.totalCourses.toLocaleString(),
      helper: 'Active and draft courses',
      icon: <BookOpen className="h-4 w-4 text-slate-600" />,
    },
    {
      label: 'Enrollments',
      value: totals.totalEnrollments.toLocaleString(),
      helper: `${totals.completionRate}% completion rate`,
      icon: <Users className="h-4 w-4 text-blue-600" />,
    },
    {
      label: 'Completions',
      value: totals.completedEnrollments.toLocaleString(),
      helper: 'Learners reached completion',
      icon: <ClipboardCheck className="h-4 w-4 text-emerald-600" />,
    },
    {
      label: 'Avg Time',
      value: `${totals.averageTimeSpentMinutes} min`,
      helper: 'Per learner in range',
      icon: <Clock3 className="h-4 w-4 text-violet-600" />,
    },
    {
      label: 'Avg Quiz Score',
      value: `${totals.averageQuizScore}%`,
      helper: 'Across graded attempts',
      icon: <Star className="h-4 w-4 text-amber-600" />,
    },
    {
      label: 'Revenue',
      value: formatCurrency(totals.totalRevenueCents),
      helper: 'Course sales in range',
      icon: <CircleDollarSign className="h-4 w-4 text-green-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


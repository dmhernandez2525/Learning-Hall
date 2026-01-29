'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface TopCourse {
  courseId: string;
  title: string;
  revenue: number;
  sales: number;
}

interface TopCoursesTableProps {
  courses: TopCourse[];
  className?: string;
}

export function TopCoursesTable({ courses, className }: TopCoursesTableProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  if (courses.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Performing Courses
          </CardTitle>
          <CardDescription>No course sales data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No courses to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...courses.map(c => c.revenue));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Top Performing Courses
        </CardTitle>
        <CardDescription>Best sellers by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => {
            const widthPercent = maxRevenue > 0 ? (course.revenue / maxRevenue) * 100 : 0;
            const isTopThree = index < 3;

            return (
              <div key={course.courseId} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isTopThree
                        ? index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-orange-100 text-orange-700'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {index + 1}
                    </span>
                    <span className="font-medium truncate">{course.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {course.sales} {course.sales === 1 ? 'sale' : 'sales'}
                    </Badge>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(course.revenue)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      index === 0 ? 'bg-amber-500' :
                      index === 1 ? 'bg-slate-400' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-blue-400'
                    )}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

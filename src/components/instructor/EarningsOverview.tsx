'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Clock,
  BookOpen,
  ShoppingCart,
} from 'lucide-react';

interface CourseEarning {
  courseId: string;
  title: string;
  revenue: number;
  sales: number;
  instructorEarnings: number;
}

interface EarningsOverviewProps {
  totalEarnings: number;
  pendingPayout: number;
  courses: CourseEarning[];
  className?: string;
}

export function EarningsOverview({
  totalEarnings,
  pendingPayout,
  courses,
  className,
}: EarningsOverviewProps) {
  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

  const totalSales = courses.reduce((sum, c) => sum + c.sales, 0);
  const totalRevenue = courses.reduce((sum, c) => sum + c.revenue, 0);
  const maxEarnings = Math.max(...courses.map(c => c.instructorEarnings));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payout
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(pendingPayout)}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Course purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Revenue
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Before fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Earnings by Course
          </CardTitle>
          <CardDescription>Your revenue share from each course</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No course sales this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course, index) => {
                const widthPercent = maxEarnings > 0
                  ? (course.instructorEarnings / maxEarnings) * 100
                  : 0;

                return (
                  <div key={course.courseId} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          index < 3
                            ? 'bg-green-100 text-green-700'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {index + 1}
                        </span>
                        <span className="font-medium truncate">{course.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {course.sales} {course.sales === 1 ? 'sale' : 'sales'}
                        </span>
                        <span className="font-semibold text-green-600 tabular-nums">
                          {formatMoney(course.instructorEarnings)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

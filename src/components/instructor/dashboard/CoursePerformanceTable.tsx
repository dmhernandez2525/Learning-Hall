'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CoursePerformanceMetric } from '@/lib/instructor-dashboard/types';

interface CoursePerformanceTableProps {
  courses: CoursePerformanceMetric[];
}

type SortKey =
  | 'title'
  | 'enrollments'
  | 'completionRate'
  | 'averageTimeSpentMinutes'
  | 'averageQuizScore'
  | 'revenueCents'
  | 'averageRating';

interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CoursePerformanceTable({ courses }: CoursePerformanceTableProps) {
  const [sort, setSort] = useState<SortState>({ key: 'revenueCents', direction: 'desc' });

  const sortedCourses = useMemo(() => {
    const next = [...courses];
    next.sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];

      if (typeof left === 'string' && typeof right === 'string') {
        return sort.direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
      }

      if (typeof left === 'number' && typeof right === 'number') {
        return sort.direction === 'asc' ? left - right : right - left;
      }

      return 0;
    });
    return next;
  }, [courses, sort]);

  const handleSort = (key: SortKey) => {
    setSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { key, direction: 'desc' };
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Course Performance Comparison</CardTitle>
        <CardDescription>Sortable metrics across your active and draft courses.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No course performance data for this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('title')}>
                      Course <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="py-2 pr-3">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('enrollments')}>
                      Enrollments <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="py-2 pr-3">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('completionRate')}>
                      Completion <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="py-2 pr-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('averageTimeSpentMinutes')}
                    >
                      Avg Time <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="py-2 pr-3">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('averageQuizScore')}>
                      Avg Quiz <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="py-2 pr-3">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('averageRating')}>
                      Rating <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="py-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('revenueCents')}>
                      Revenue <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map((course) => (
                  <tr key={course.courseId} className="border-b last:border-b-0">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{course.status}</p>
                    </td>
                    <td className="py-3 pr-3">{course.enrollments.toLocaleString()}</td>
                    <td className="py-3 pr-3">{course.completionRate}%</td>
                    <td className="py-3 pr-3">{course.averageTimeSpentMinutes} min</td>
                    <td className="py-3 pr-3">{course.averageQuizScore}%</td>
                    <td className="py-3 pr-3">{course.averageRating}</td>
                    <td className="py-3">{formatCurrency(course.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


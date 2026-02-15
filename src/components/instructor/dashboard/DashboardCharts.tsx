'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  CoursePerformanceMetric,
  DashboardTimelinePoint,
  RatingTrendPoint,
  RevenueSlice,
} from '@/lib/instructor-dashboard/types';

interface SimpleLineChartProps {
  data: DashboardTimelinePoint[];
  title: string;
  description: string;
  colorClass?: string;
  valueFormatter?: (value: number) => string;
}

interface RatingLineChartProps {
  data: RatingTrendPoint[];
}

interface CompletionBarChartProps {
  courses: CoursePerformanceMetric[];
}

interface RevenuePieChartProps {
  slices: RevenueSlice[];
}

interface DashboardChartsProps {
  enrollmentsTimeline: DashboardTimelinePoint[];
  ratingTrend: RatingTrendPoint[];
  coursePerformance: CoursePerformanceMetric[];
  revenueByCourse: RevenueSlice[];
}

function buildLinePath(data: DashboardTimelinePoint[]): string {
  if (data.length === 0) {
    return '';
  }

  const width = 520;
  const height = 170;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  return data
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.value / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function SimpleLineChart({
  data,
  title,
  description,
  colorClass = 'stroke-blue-600',
  valueFormatter = (value) => value.toLocaleString(),
}: SimpleLineChartProps) {
  const path = buildLinePath(data);
  const latest = data[data.length - 1]?.value ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trend data for this period.</p>
        ) : (
          <div>
            <svg viewBox="0 0 540 190" className="w-full h-[180px]">
              <path d={path} fill="none" className={`${colorClass} stroke-[3]`} />
            </svg>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{data[0]?.label}</span>
              <span className="font-medium text-foreground">{valueFormatter(latest)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RatingLineChart({ data }: RatingLineChartProps) {
  const points = data.map((point) => ({
    isoDate: point.isoDate,
    label: point.label,
    value: point.rollingAverage || point.averageRating,
  }));

  return (
    <SimpleLineChart
      data={points}
      title="Instructor Rating Trend"
      description="Rolling average of approved review ratings."
      colorClass="stroke-amber-500"
      valueFormatter={(value) => `${value.toFixed(2)} / 5`}
    />
  );
}

export function CompletionBarChart({ courses }: CompletionBarChartProps) {
  const topCourses = [...courses]
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 6);

  const maxValue = Math.max(...topCourses.map((course) => course.completionRate), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Completion Rate by Course</CardTitle>
        <CardDescription>Top courses by enrollment, sorted for comparison.</CardDescription>
      </CardHeader>
      <CardContent>
        {topCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completion data available.</p>
        ) : (
          <div className="space-y-3">
            {topCourses.map((course) => (
              <div key={course.courseId}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate pr-2">{course.title}</span>
                  <span>{course.completionRate}%</span>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div
                    className="h-2 rounded bg-emerald-500"
                    style={{ width: `${Math.max((course.completionRate / maxValue) * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export function RevenuePieChart({ slices }: RevenuePieChartProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offsetAccumulator = 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Revenue Mix</CardTitle>
        <CardDescription>Pie distribution of course revenue contribution.</CardDescription>
      </CardHeader>
      <CardContent>
        {slices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No revenue was recorded in this range.</p>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <svg viewBox="0 0 160 160" className="h-36 w-36">
              <g transform="translate(80,80) rotate(-90)">
                {slices.map((slice, index) => {
                  const dash = (slice.sharePercent / 100) * circumference;
                  const dashArray = `${dash} ${circumference - dash}`;
                  const dashOffset = -offsetAccumulator;
                  offsetAccumulator += dash;

                  return (
                    <circle
                      key={slice.courseId}
                      r={radius}
                      cx={0}
                      cy={0}
                      fill="transparent"
                      stroke={PIE_COLORS[index % PIE_COLORS.length]}
                      strokeWidth={28}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </g>
            </svg>

            <ul className="space-y-1 text-xs">
              {slices.slice(0, 6).map((slice, index) => (
                <li key={slice.courseId} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="truncate max-w-[170px]">{slice.title}</span>
                  <span className="text-muted-foreground">{slice.sharePercent}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  enrollmentsTimeline,
  ratingTrend,
  coursePerformance,
  revenueByCourse,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <SimpleLineChart
        data={enrollmentsTimeline}
        title="Enrollment Trend"
        description="Line trend of new enrollments in the selected date range."
      />
      <RatingLineChart data={ratingTrend} />
      <CompletionBarChart courses={coursePerformance} />
      <RevenuePieChart slices={revenueByCourse} />
    </div>
  );
}


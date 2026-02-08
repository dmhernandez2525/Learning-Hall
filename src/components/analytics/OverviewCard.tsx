'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  loading,
  prefix = '',
  suffix = '',
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {prefix}
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix}
            </div>
            {change !== undefined && (
              <p
                className={cn(
                  'text-xs flex items-center gap-1',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change)}% from last period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  newEnrollments: number;
  completionRate: number;
  avgTimeOnPlatform: number;
  revenue: number;
  revenueGrowth: number;
}

interface OverviewCardsProps {
  metrics?: OverviewMetrics;
  loading?: boolean;
  className?: string;
}

export function OverviewCards({ metrics, loading = false, className }: OverviewCardsProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <MetricCard
        title="Total Users"
        value={metrics?.totalUsers || 0}
        icon={Users}
        loading={loading}
      />
      <MetricCard
        title="Active Users"
        value={metrics?.activeUsers || 0}
        icon={UserPlus}
        loading={loading}
      />
      <MetricCard
        title="New Users"
        value={metrics?.newUsers || 0}
        icon={UserPlus}
        loading={loading}
      />
      <MetricCard
        title="Total Courses"
        value={metrics?.totalCourses || 0}
        icon={BookOpen}
        loading={loading}
      />
      <MetricCard
        title="Total Enrollments"
        value={metrics?.totalEnrollments || 0}
        icon={GraduationCap}
        loading={loading}
      />
      <MetricCard
        title="New Enrollments"
        value={metrics?.newEnrollments || 0}
        icon={GraduationCap}
        loading={loading}
      />
      <MetricCard
        title="Completion Rate"
        value={metrics?.completionRate || 0}
        suffix="%"
        icon={BarChart3}
        loading={loading}
      />
      <MetricCard
        title="Avg. Session Time"
        value={formatTime(metrics?.avgTimeOnPlatform || 0)}
        icon={Clock}
        loading={loading}
      />
      <MetricCard
        title="Revenue"
        value={metrics?.revenue || 0}
        prefix="$"
        change={metrics?.revenueGrowth}
        icon={DollarSign}
        loading={loading}
      />
    </div>
  );
}

export { MetricCard };

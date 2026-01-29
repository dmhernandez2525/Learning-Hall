'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { RevenueOverviewCards } from './RevenueOverviewCards';
import { RevenueChart } from './RevenueChart';
import { ProductTypeBreakdown } from './ProductTypeBreakdown';
import { TopCoursesTable } from './TopCoursesTable';
import { SubscriptionMetrics } from './SubscriptionMetrics';

interface RevenueAnalyticsData {
  overview: {
    totalRevenue: number;
    netRevenue: number;
    totalRefunds: number;
    transactionCount: number;
    averageOrderValue: number;
    refundRate: number;
  };
  byPeriod: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
  byProductType: Record<string, { revenue: number; count: number }>;
  topCourses: Array<{
    courseId: string;
    title: string;
    revenue: number;
    sales: number;
  }>;
  subscriptionMetrics: {
    activeSubscriptions: number;
    mrr: number;
    arr: number;
    churnRate: number;
    canceledLast30Days: number;
    planDistribution: Record<string, number>;
  };
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

interface RevenueAnalyticsDashboardProps {
  className?: string;
}

export function RevenueAnalyticsDashboard({ className }: RevenueAnalyticsDashboardProps) {
  const [data, setData] = useState<RevenueAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [days, setDays] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics/revenue?period=${period}&days=${days}`);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to load analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  }, [period, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchAnalytics} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const formatDateRange = () => {
    const start = new Date(data.dateRange.start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = new Date(data.dateRange.end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground">{formatDateRange()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(v) => setPeriod(v as 'day' | 'week' | 'month')}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <RevenueOverviewCards stats={data.overview} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={data.byPeriod} period={period} />
        <ProductTypeBreakdown data={data.byProductType} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopCoursesTable courses={data.topCourses} />
        <SubscriptionMetrics metrics={data.subscriptionMetrics} />
      </div>
    </div>
  );
}

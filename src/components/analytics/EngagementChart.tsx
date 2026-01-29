'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Activity, Play, Users, TrendingUp, Clock } from 'lucide-react';

interface TimeSeriesData {
  date: string;
  count: number;
}

interface VideoEngagement {
  totalViews: number;
  avgWatchTime: number;
  completionRate: number;
}

interface TopContent {
  id: string;
  title: string;
  views: number;
  avgEngagement: number;
}

interface EngagementMetrics {
  dailyActiveUsers: TimeSeriesData[];
  weeklyActiveUsers: TimeSeriesData[];
  monthlyActiveUsers: TimeSeriesData[];
  avgSessionDuration: number;
  avgLessonsPerSession: number;
  avgQuizAttempts: number;
  videoEngagement: VideoEngagement;
  topContent: TopContent[];
}

interface EngagementChartProps {
  tenantId?: string;
  period?: 'week' | 'month' | 'quarter';
  className?: string;
}

// Simple bar chart component
function SimpleBarChart({
  data,
  height = 200,
  className,
}: {
  data: TimeSeriesData[];
  height?: number;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-muted-foreground', className)}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className={cn('flex items-end gap-1', className)} style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.count / maxCount) * (height - 40);
        return (
          <div key={index} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
              style={{ height: Math.max(barHeight, 4) }}
              title={`${item.date}: ${item.count} users`}
            />
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
              {item.date.split('-').slice(-1)[0] || item.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Stats row component
function StatsRow({
  items,
  loading,
}: {
  items: { label: string; value: string | number; icon: React.ReactNode }[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">{item.icon}</div>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <p className="font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EngagementChart({
  tenantId,
  period = 'month',
  className,
}: EngagementChartProps) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (tenantId) params.set('tenantId', tenantId);

      const response = await fetch(`/api/analytics/engagement?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tenantId, period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getActiveData = () => {
    if (!metrics) return [];
    switch (activeTab) {
      case 'daily':
        return metrics.dailyActiveUsers;
      case 'weekly':
        return metrics.weeklyActiveUsers;
      case 'monthly':
        return metrics.monthlyActiveUsers;
      default:
        return [];
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Active Users Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Users
          </CardTitle>
          <CardDescription>User activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {loading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <SimpleBarChart data={getActiveData()} height={200} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Engagement Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engagement Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatsRow
            loading={loading}
            items={[
              {
                label: 'Avg. Session Duration',
                value: formatTime(metrics?.avgSessionDuration || 0),
                icon: <Clock className="h-4 w-4 text-primary" />,
              },
              {
                label: 'Lessons per Session',
                value: metrics?.avgLessonsPerSession.toFixed(1) || '0',
                icon: <Activity className="h-4 w-4 text-primary" />,
              },
              {
                label: 'Quiz Attempts Avg.',
                value: metrics?.avgQuizAttempts.toFixed(1) || '0',
                icon: <TrendingUp className="h-4 w-4 text-primary" />,
              },
              {
                label: 'Active Users',
                value: metrics?.dailyActiveUsers.slice(-1)[0]?.count || 0,
                icon: <Users className="h-4 w-4 text-primary" />,
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Video Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Video Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatsRow
            loading={loading}
            items={[
              {
                label: 'Total Views',
                value: metrics?.videoEngagement.totalViews.toLocaleString() || '0',
                icon: <Play className="h-4 w-4 text-primary" />,
              },
              {
                label: 'Avg. Watch Time',
                value: formatTime(metrics?.videoEngagement.avgWatchTime || 0),
                icon: <Clock className="h-4 w-4 text-primary" />,
              },
              {
                label: 'Completion Rate',
                value: `${metrics?.videoEngagement.completionRate || 0}%`,
                icon: <TrendingUp className="h-4 w-4 text-primary" />,
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Content</CardTitle>
          <CardDescription>Most viewed courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : metrics?.topContent && metrics.topContent.length > 0 ? (
            <div className="space-y-3">
              {metrics.topContent.map((content, index) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium truncate">{content.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {content.views.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No content data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

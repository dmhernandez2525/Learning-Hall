'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MentorshipAnalytics as AnalyticsData } from '@/types/mentorship';

interface MentorshipAnalyticsProps {
  mentorUserId?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

interface SessionBreakdownProps {
  completed: number;
  cancelled: number;
  noShow: number;
  total: number;
}

function SessionBreakdownChart({ completed, cancelled, noShow, total }: SessionBreakdownProps) {
  if (total === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No session data yet.</p>;
  }

  const scheduled = total - completed - cancelled - noShow;
  const segments = [
    { label: 'Completed', count: completed, color: '#22c55e' },
    { label: 'Scheduled', count: scheduled, color: '#3b82f6' },
    { label: 'Cancelled', count: cancelled, color: '#9ca3af' },
    { label: 'No-show', count: noShow, color: '#ef4444' },
  ].filter((s) => s.count > 0);

  const barWidth = 300;
  const barHeight = 24;

  let offset = 0;

  return (
    <div className="space-y-2">
      <svg width={barWidth} height={barHeight} className="rounded overflow-hidden">
        {segments.map((segment) => {
          const width = (segment.count / total) * barWidth;
          const x = offset;
          offset += width;
          return (
            <rect
              key={segment.label}
              x={x}
              y={0}
              width={width}
              height={barHeight}
              fill={segment.color}
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 text-xs">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label}: {segment.count}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MentorshipAnalyticsDashboard({ mentorUserId }: MentorshipAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const url = mentorUserId
        ? `/api/mentorship/analytics?mentorUserId=${mentorUserId}`
        : '/api/mentorship/analytics';
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as { doc: AnalyticsData };
      setAnalytics(data.doc);
    } finally {
      setIsLoading(false);
    }
  }, [mentorUserId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  if (!analytics) {
    return <p className="text-sm text-muted-foreground">No analytics available.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Mentorship Analytics</h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Matches" value={analytics.totalMatches} />
        <StatCard label="Active Matches" value={analytics.activeMatches} />
        <StatCard label="Completed" value={analytics.completedMatches} />
        <StatCard label="Avg Rating" value={analytics.averageRating > 0 ? analytics.averageRating : 'N/A'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Session Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionBreakdownChart
            completed={analytics.completedSessions}
            cancelled={analytics.cancelledSessions}
            noShow={analytics.noShowSessions}
            total={analytics.totalSessions}
          />
        </CardContent>
      </Card>
    </div>
  );
}

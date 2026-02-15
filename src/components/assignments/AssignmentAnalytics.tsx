'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AssignmentAnalytics as AnalyticsData } from '@/types/assignments';

interface AssignmentAnalyticsProps {
  assignmentId: string;
}

function DistributionChart({ data }: { data: Array<{ range: string; count: number }> }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = 50;
  const svgWidth = barWidth * data.length;
  const svgHeight = 100;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-md" preserveAspectRatio="none">
      {data.map((item, index) => {
        const barHeight = (item.count / maxCount) * (svgHeight - 24);
        return (
          <g key={index}>
            <rect
              x={index * barWidth + 4}
              y={svgHeight - 24 - barHeight}
              width={barWidth - 8}
              height={Math.max(barHeight, 1)}
              fill="hsl(var(--primary))"
              rx={2}
            />
            <text
              x={index * barWidth + barWidth / 2}
              y={svgHeight - 12}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={7}
            >
              {item.range}
            </text>
            <text
              x={index * barWidth + barWidth / 2}
              y={svgHeight - 24 - barHeight - 4}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={8}
            >
              {item.count > 0 ? item.count : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AssignmentAnalytics({ assignmentId }: AssignmentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/analytics`);
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to load analytics');
        return;
      }
      const data = (await response.json()) as { doc: AnalyticsData };
      setAnalytics(data.doc);
    } catch {
      setError('Network error loading analytics');
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!analytics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Assignment Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Submissions" value={String(analytics.totalSubmissions)} />
          <StatCard label="Graded" value={String(analytics.gradedCount)} />
          <StatCard label="Avg. Score" value={String(analytics.averageScore)} />
          <StatCard
            label="On Time"
            value={`${analytics.onTimeCount}/${analytics.totalSubmissions}`}
          />
        </div>

        <div>
          <h5 className="mb-2 text-xs font-medium text-muted-foreground">Score Distribution</h5>
          <DistributionChart data={analytics.scoreDistribution} />
        </div>

        {analytics.criteriaAverages.length > 0 ? (
          <div>
            <h5 className="mb-1 text-xs font-medium text-muted-foreground">Rubric Criteria Performance</h5>
            <ul className="space-y-1">
              {analytics.criteriaAverages.map((criterion) => (
                <li key={criterion.criterionId} className="flex justify-between text-sm">
                  <span>{criterion.title}</span>
                  <span className="text-muted-foreground">
                    {criterion.average} / {criterion.maxPoints}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

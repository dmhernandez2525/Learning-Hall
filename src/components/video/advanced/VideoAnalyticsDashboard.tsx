'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LessonVideoAnalytics, VideoHeatmapBin } from '@/types/video-learning';

interface VideoAnalyticsDashboardProps {
  lessonId: string;
}

function HeatmapChart({ bins }: { bins: VideoHeatmapBin[] }) {
  if (bins.length === 0) {
    return <p className="text-xs text-muted-foreground">No watch data available.</p>;
  }

  const maxViews = Math.max(...bins.map((bin) => bin.views), 1);
  const barWidth = Math.max(1, Math.floor(300 / bins.length));
  const svgWidth = barWidth * bins.length;
  const svgHeight = 120;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" preserveAspectRatio="none">
      {bins.map((bin, index) => {
        const barHeight = (bin.views / maxViews) * (svgHeight - 20);
        const intensity = bin.views / maxViews;
        const r = Math.round(59 + intensity * 196);
        const g = Math.round(130 + (1 - intensity) * 60);
        const b = Math.round(246 - intensity * 146);
        return (
          <g key={index}>
            <rect
              x={index * barWidth}
              y={svgHeight - 20 - barHeight}
              width={Math.max(barWidth - 1, 1)}
              height={Math.max(barHeight, 1)}
              fill={`rgb(${r},${g},${b})`}
              rx={1}
            />
            {index % Math.ceil(bins.length / 5) === 0 ? (
              <text
                x={index * barWidth + barWidth / 2}
                y={svgHeight - 4}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={8}
              >
                {Math.round(bin.start)}s
              </text>
            ) : null}
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

export function VideoAnalyticsDashboard({ lessonId }: VideoAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<LessonVideoAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/video-analytics`);
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to load analytics');
        return;
      }
      const data = (await response.json()) as { doc: LessonVideoAnalytics };
      setAnalytics(data.doc);
    } catch {
      setError('Network error loading analytics');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Video Analytics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Video Analytics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Video Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Views" value={String(analytics.totalViews)} />
          <StatCard label="Completion Rate" value={`${analytics.completionRate}%`} />
          <StatCard
            label="Avg. Watch Position"
            value={`${Math.round(analytics.averageWatchPosition)}s`}
          />
        </div>

        <div>
          <h5 className="mb-2 text-xs font-medium text-muted-foreground">Watch Heatmap</h5>
          <HeatmapChart bins={analytics.heatmap} />
        </div>

        {analytics.dropOffPoints.length > 0 ? (
          <div>
            <h5 className="mb-1 text-xs font-medium text-muted-foreground">Top Drop-off Points</h5>
            <ul className="space-y-1">
              {analytics.dropOffPoints.map((point, index) => (
                <li key={index} className="flex justify-between text-xs">
                  <span>
                    {Math.round(point.start)}s - {Math.round(point.end)}s
                  </span>
                  <span className="text-muted-foreground">{point.views} views</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

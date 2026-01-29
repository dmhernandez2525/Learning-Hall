'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Users, Zap, Activity, AlertCircle, Moon } from 'lucide-react';

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  avgEngagement: number;
  avgRevenue: number;
}

interface UserSegmentsProps {
  tenantId?: string;
  className?: string;
}

const segmentIcons: Record<string, React.ReactNode> = {
  'Power Users': <Zap className="h-4 w-4 text-yellow-500" />,
  'Active Learners': <Activity className="h-4 w-4 text-green-500" />,
  'Casual Users': <Users className="h-4 w-4 text-blue-500" />,
  'At Risk': <AlertCircle className="h-4 w-4 text-orange-500" />,
  Dormant: <Moon className="h-4 w-4 text-gray-500" />,
};

const segmentColors: Record<string, string> = {
  'Power Users': 'bg-yellow-500',
  'Active Learners': 'bg-green-500',
  'Casual Users': 'bg-blue-500',
  'At Risk': 'bg-orange-500',
  Dormant: 'bg-gray-400',
};

// Simple pie chart visualization using conic gradient
function PieChart({ segments, size = 200 }: { segments: UserSegment[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) {
    return (
      <div
        className="rounded-full bg-muted flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground text-sm">No data</span>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const gradientParts = segments.map((segment) => {
    const start = cumulativePercentage;
    cumulativePercentage += segment.percentage;
    const color =
      segmentColors[segment.name] ||
      `hsl(${(segments.indexOf(segment) * 60) % 360}, 70%, 50%)`;
    return `${color} ${start}% ${cumulativePercentage}%`;
  });

  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div
      className="rounded-full relative"
      style={{
        width: size,
        height: size,
        background: gradient,
      }}
    >
      <div
        className="absolute inset-0 m-auto rounded-full bg-background flex items-center justify-center"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
      </div>
    </div>
  );
}

export function UserSegments({ tenantId, className }: UserSegmentsProps) {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tenantId) params.set('tenantId', tenantId);

      const response = await fetch(`/api/analytics/segments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSegments(data.segments || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Segments
        </CardTitle>
        <CardDescription>Users grouped by engagement level</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
            <div className="w-full space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <PieChart segments={segments} />

            <div className="w-full space-y-3">
              {segments.map((segment) => (
                <div
                  key={segment.name}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        segmentColors[segment.name] || 'bg-primary'
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {segmentIcons[segment.name]}
                      <span className="font-medium">{segment.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {segment.count.toLocaleString()}{' '}
                      <span className="text-muted-foreground text-sm font-normal">
                        ({segment.percentage}%)
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg. ${segment.avgRevenue.toFixed(2)} revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Segment descriptions */}
            <div className="w-full pt-4 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Segment Definitions:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                  <strong>Power Users:</strong> 50+ activities in last 30 days
                </li>
                <li>
                  <strong>Active Learners:</strong> 20-49 activities
                </li>
                <li>
                  <strong>Casual Users:</strong> 5-19 activities
                </li>
                <li>
                  <strong>At Risk:</strong> 1-4 activities
                </li>
                <li>
                  <strong>Dormant:</strong> No activity in last 30 days
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

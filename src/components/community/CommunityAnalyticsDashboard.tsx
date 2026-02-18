'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CommunityAnalytics } from '@/types/community';

export function CommunityAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/community/analytics');
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data.doc ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  if (!analytics) return <p className="text-sm text-muted-foreground">No analytics available.</p>;

  const stats = [
    { label: 'Total Profiles', value: analytics.totalProfiles },
    { label: 'Public Profiles', value: analytics.publicProfiles },
    { label: 'Messages', value: analytics.totalMessages },
    { label: 'Activities', value: analytics.totalActivities },
  ];

  const actionEntries = Object.entries(analytics.activitiesByAction);
  const maxAction = Math.max(...actionEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = actionEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Community Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {actionEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Activities by Action</h3>
          <svg width={barWidth + 160} height={svgHeight} role="img" aria-label="Activities by action chart">
            {actionEntries.map(([action, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxAction) * barWidth;
              return (
                <g key={action}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{action}</text>
                  <rect x={120} y={y} width={w} height={barHeight} rx={4} fill="#f59e0b" opacity={0.8} />
                  <text x={120 + w + 6} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{count}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

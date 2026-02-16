'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VirtualClassroomAnalytics } from '@/types/virtual-classroom';

export function VirtualClassroomAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<VirtualClassroomAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/virtual-classroom/analytics');
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
    { label: 'Total Sessions', value: analytics.totalSessions },
    { label: 'Live Now', value: analytics.liveSessions },
    { label: 'Completed', value: analytics.completedSessions },
    { label: 'Total Participants', value: analytics.totalParticipants },
    { label: 'Avg per Session', value: analytics.avgParticipants },
  ];

  const statusEntries = Object.entries(analytics.sessionsByStatus);
  const maxStatus = Math.max(...statusEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = statusEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Virtual Classroom Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {statusEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Sessions by Status</h3>
          <svg width={barWidth + 140} height={svgHeight} role="img" aria-label="Sessions by status chart">
            {statusEntries.map(([status, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxStatus) * barWidth;
              return (
                <g key={status}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{status}</text>
                  <rect x={100} y={y} width={w} height={barHeight} rx={4} fill="#3b82f6" opacity={0.8} />
                  <text x={100 + w + 6} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{count}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

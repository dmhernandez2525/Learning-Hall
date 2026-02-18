'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AuditAnalytics } from '@/types/audit';

export function AuditAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AuditAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/audit/analytics');
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
    { label: 'Total Entries', value: analytics.totalEntries },
    { label: 'Last 24h', value: analytics.entriesLast24h },
    { label: 'Last 7 Days', value: analytics.entriesLast7d },
  ];

  const actionEntries = Object.entries(analytics.topActions).sort(([, a], [, b]) => b - a).slice(0, 5);
  const maxAction = Math.max(...actionEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 20;
  const svgHeight = actionEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Audit Analytics</h2>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {actionEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Top Actions (7 days)</h3>
          <svg width={barWidth + 140} height={svgHeight} role="img" aria-label="Top actions chart">
            {actionEntries.map(([action, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxAction) * barWidth;
              return (
                <g key={action}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={11} fill="currentColor">{action}</text>
                  <rect x={80} y={y} width={w} height={barHeight} rx={3} fill="#f59e0b" opacity={0.8} />
                  <text x={80 + w + 6} y={y + barHeight / 2 + 4} fontSize={11} fill="currentColor">{count}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

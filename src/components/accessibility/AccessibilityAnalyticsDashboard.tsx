'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AccessibilityAnalytics } from '@/types/accessibility';

export function AccessibilityAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AccessibilityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/accessibility/analytics');
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
    { label: 'Total Audits', value: analytics.totalAudits },
    { label: 'Completed', value: analytics.completedAudits },
    { label: 'Avg Score', value: analytics.avgScore },
    { label: 'Total Issues', value: analytics.totalIssues },
  ];

  const severityEntries = Object.entries(analytics.issuesBySeverity);
  const maxSeverity = Math.max(...severityEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = severityEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Accessibility Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {severityEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Issues by Severity</h3>
          <svg width={barWidth + 120} height={svgHeight} role="img" aria-label="Issues by severity chart">
            {severityEntries.map(([severity, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxSeverity) * barWidth;
              const colors: Record<string, string> = { error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
              return (
                <g key={severity}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{severity}</text>
                  <rect x={80} y={y} width={w} height={barHeight} rx={4} fill={colors[severity] ?? '#6b7280'} opacity={0.8} />
                  <text x={80 + w + 6} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{count}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

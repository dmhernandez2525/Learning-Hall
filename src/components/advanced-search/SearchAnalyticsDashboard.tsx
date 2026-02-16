'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SearchAnalytics } from '@/types/advanced-search';

export function SearchAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/advanced-search/analytics');
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
    { label: 'Total Searches', value: analytics.totalSearches },
    { label: 'Avg Results', value: analytics.avgResultCount },
  ];

  const typeEntries = Object.entries(analytics.searchesByType);
  const maxType = Math.max(...typeEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = typeEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Search Analytics</h2>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {typeEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Searches by Type</h3>
          <svg width={barWidth + 120} height={svgHeight} role="img" aria-label="Searches by type chart">
            {typeEntries.map(([type, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxType) * barWidth;
              return (
                <g key={type}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{type}</text>
                  <rect x={80} y={y} width={w} height={barHeight} rx={4} fill="#3b82f6" opacity={0.8} />
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

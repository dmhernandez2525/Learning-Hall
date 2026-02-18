'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AIContentAnalytics } from '@/types/ai-content';

export function AIContentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AIContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/ai-content/analytics');
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
    { label: 'Total Suggestions', value: analytics.totalSuggestions },
    { label: 'Accepted', value: analytics.acceptedSuggestions },
    { label: 'Total Quizzes', value: analytics.totalQuizzes },
    { label: 'Published Quizzes', value: analytics.publishedQuizzes },
    { label: 'Summaries', value: analytics.totalSummaries },
  ];

  const typeEntries = Object.entries(analytics.suggestionsByType);
  const maxType = Math.max(...typeEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = typeEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">AI Content Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {typeEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Suggestions by Type</h3>
          <svg width={barWidth + 140} height={svgHeight} role="img" aria-label="Suggestions by type chart">
            {typeEntries.map(([type, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxType) * barWidth;
              return (
                <g key={type}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{type}</text>
                  <rect x={100} y={y} width={w} height={barHeight} rx={4} fill="#8b5cf6" opacity={0.8} />
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

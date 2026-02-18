'use client';

import { useState, useCallback, useEffect } from 'react';
import type { MicrolearningAnalytics } from '@/types/microlearning';

export function MicrolearningAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<MicrolearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/microlearning/analytics');
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
    { label: 'Total Micro Lessons', value: analytics.totalMicroLessons },
    { label: 'Published Lessons', value: analytics.publishedLessons },
    { label: 'Total Cards', value: analytics.totalCards },
    { label: 'Due Cards', value: analytics.dueCards },
    { label: 'Total Challenges', value: analytics.totalChallenges },
  ];

  const diffEntries = Object.entries(analytics.challengesByDifficulty);
  const maxDiff = Math.max(...diffEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = diffEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Microlearning Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {diffEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Challenges by Difficulty</h3>
          <svg width={barWidth + 120} height={svgHeight} role="img" aria-label="Challenges by difficulty chart">
            {diffEntries.map(([difficulty, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxDiff) * barWidth;
              const colors: Record<string, string> = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
              return (
                <g key={difficulty}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{difficulty}</text>
                  <rect x={80} y={y} width={w} height={barHeight} rx={4} fill={colors[difficulty] ?? '#6b7280'} opacity={0.8} />
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

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SkillsAnalytics } from '@/types/skills';

export function SkillsAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SkillsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/skills/analytics');
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

  const categoryEntries = Object.entries(analytics.skillsByCategory);
  const maxCount = Math.max(...categoryEntries.map(([, c]) => c), 1);
  const barWidth = 220;
  const barHeight = 22;
  const svgHeight = categoryEntries.length * (barHeight + 8) + 16;

  const stats = [
    { label: 'Total Skills', value: analytics.totalSkills },
    { label: 'Mappings', value: analytics.totalMappings },
    { label: 'Assessments', value: analytics.totalAssessments },
    { label: 'Avg Gap', value: analytics.averageGap },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Skills Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {categoryEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Skills by Category</h3>
          <svg width={barWidth + 140} height={svgHeight} role="img" aria-label="Skills by category chart">
            {categoryEntries.map(([cat, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxCount) * barWidth;
              return (
                <g key={cat}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">
                    {cat}
                  </text>
                  <rect x={100} y={y} width={w} height={barHeight} rx={4} fill="#8b5cf6" opacity={0.8} />
                  <text x={100 + w + 6} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

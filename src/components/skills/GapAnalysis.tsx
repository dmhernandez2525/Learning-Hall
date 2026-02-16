'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SkillGapResult } from '@/types/skills';

interface GapAnalysisProps {
  userId?: string;
}

export function GapAnalysis({ userId }: GapAnalysisProps) {
  const [gaps, setGaps] = useState<SkillGapResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGaps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);

    const res = await fetch(`/api/skills/gap-analysis?${params}`);
    if (res.ok) {
      const data = await res.json();
      setGaps(data.docs ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchGaps();
  }, [fetchGaps]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading gap analysis...</p>;

  if (gaps.length === 0) {
    return <p className="text-sm text-muted-foreground">No skill gaps identified.</p>;
  }

  const maxGap = Math.max(...gaps.map((g) => g.gap), 1);
  const barWidth = 200;
  const barHeight = 20;
  const svgHeight = gaps.length * (barHeight + 12) + 16;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Gap Analysis</h2>

      <svg width={barWidth + 200} height={svgHeight} role="img" aria-label="Skill gap chart">
        {gaps.map((g, i) => {
          const y = i * (barHeight + 12) + 8;
          const w = (g.gap / maxGap) * barWidth;
          return (
            <g key={g.skillId}>
              <text x={0} y={y + barHeight / 2 + 4} fontSize={11} fill="currentColor">
                {g.skillName || g.skillId}
              </text>
              <rect
                x={120}
                y={y}
                width={w}
                height={barHeight}
                rx={3}
                fill="#ef4444"
                opacity={0.7 + (g.gap / maxGap) * 0.3}
              />
              <text x={120 + w + 6} y={y + barHeight / 2 + 4} fontSize={11} fill="currentColor">
                {g.currentLevel} → {g.targetLevel}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="space-y-2">
        {gaps.map((g) => (
          <div key={g.skillId} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{g.skillName || g.skillId}</h3>
              <span className="text-sm text-muted-foreground">Gap: {g.gap} levels</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {g.currentLevel} → {g.targetLevel}
            </p>
            {g.recommendedCourses.length > 0 && (
              <p className="mt-1 text-xs">
                Recommended courses: {g.recommendedCourses.length}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

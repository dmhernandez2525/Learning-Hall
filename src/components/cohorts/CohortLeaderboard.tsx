'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CohortLeaderboardEntry } from '@/types/cohorts';

interface CohortLeaderboardProps {
  cohortId: string;
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800';
  if (rank === 2) return 'bg-gray-100 text-gray-700';
  if (rank === 3) return 'bg-orange-100 text-orange-700';
  return 'bg-muted text-muted-foreground';
}

export function CohortLeaderboard({ cohortId }: CohortLeaderboardProps) {
  const [entries, setEntries] = useState<CohortLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/cohorts/${cohortId}/leaderboard`);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: CohortLeaderboardEntry[] };
      setEntries(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [cohortId]);

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading leaderboard...</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No members in this cohort yet.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cohort Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.userId} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadgeClass(entry.rank)}`}
              >
                {entry.rank}
              </span>
              <span className="flex-1 text-sm font-medium truncate">
                {entry.displayName}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(entry.completionPercent, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {entry.completionPercent}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

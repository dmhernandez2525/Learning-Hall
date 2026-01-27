'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  level: number;
  title: string;
  rank: number;
  name?: string;
  avatar?: string;
}

interface LeaderboardProps {
  limit?: number;
  showPagination?: boolean;
  highlightUserId?: string;
}

export function Leaderboard({ limit = 10, showPagination = true, highlightUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/gamification/leaderboard?limit=${limit}&page=${page}&includeUser=true`
        );
        if (response.ok) {
          const data = await response.json();
          setEntries(data.leaderboard);
          setTotalPages(data.totalPages);
          setUserRank(data.userRank);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [limit, page]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 border-amber-300';
    if (rank === 2) return 'bg-gray-100 border-gray-300';
    if (rank === 3) return 'bg-orange-100 border-orange-300';
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏅</span> Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                    getRankStyle(entry.rank),
                    highlightUserId === entry.userId && 'ring-2 ring-primary'
                  )}
                >
                  <div className="w-10 text-center text-lg font-bold">
                    {getRankDisplay(entry.rank)}
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {entry.level}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {entry.name || `User ${entry.userId.slice(-4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.title}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>

            {userRank && !entries.find((e) => e.userId === highlightUserId) && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs text-muted-foreground">Your Position</p>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3'
                  )}
                >
                  <div className="w-10 text-center text-lg font-bold">
                    #{userRank.rank}
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {userRank.level}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">You</p>
                    <p className="text-xs text-muted-foreground">{userRank.title}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">{userRank.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              </div>
            )}

            {showPagination && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

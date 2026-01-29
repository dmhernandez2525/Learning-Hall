'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Crown, ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  level: number;
  title: string;
  rank: number;
  name?: string;
  avatar?: string;
}

type TimePeriod = 'weekly' | 'monthly' | 'all-time';

interface LeaderboardProps {
  limit?: number;
  showPagination?: boolean;
  highlightUserId?: string;
  showTimePeriod?: boolean;
}

export function Leaderboard({ limit = 10, showPagination = true, highlightUserId, showTimePeriod = true }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gamification/leaderboard?limit=${limit}&page=${page}&includeUser=true&period=${timePeriod}`
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
  }, [limit, page, timePeriod]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500 fill-amber-200" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-200" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500 fill-orange-200" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300';
    return 'hover:bg-muted/50';
  };

  // Generate initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate avatar color based on userId
  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const timePeriodOptions: { value: TimePeriod; label: string }[] = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all-time', label: 'All Time' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{entries.length} learners</span>
          </div>
        </div>

        {/* Time Period Filter */}
        {showTimePeriod && (
          <div className="flex gap-1 mt-3 p-1 bg-muted rounded-lg">
            {timePeriodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTimePeriod(option.value);
                  setPage(1);
                }}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  timePeriod === option.value
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No rankings yet</p>
            <p className="text-sm">Start learning to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 transition-all duration-200',
                    getRankStyle(entry.rank),
                    highlightUserId === entry.userId && 'ring-2 ring-primary',
                    index === 0 && 'border-2'
                  )}
                >
                  {/* Rank Badge */}
                  <div className="w-10 flex items-center justify-center">
                    {getRankDisplay(entry.rank)}
                  </div>

                  {/* Avatar with Initials */}
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold',
                    getAvatarColor(entry.userId)
                  )}>
                    {getInitials(entry.name)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {entry.name || `User ${entry.userId.slice(-4)}`}
                      </p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        Lv.{entry.level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.title}</p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="font-bold text-primary tabular-nums">
                      {entry.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* User's Position (if not in top list) */}
            {userRank && !entries.find((e) => e.userId === highlightUserId) && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs text-muted-foreground font-medium">Your Position</p>
                <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
                  <div className="w-10 text-center">
                    <span className="text-sm font-bold text-primary">#{userRank.rank}</span>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {userRank.level}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">You</p>
                    <p className="text-xs text-muted-foreground">{userRank.title}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary tabular-nums">
                      {userRank.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2 tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

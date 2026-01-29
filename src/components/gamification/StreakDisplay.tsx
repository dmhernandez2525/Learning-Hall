'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  variant?: 'card' | 'compact' | 'inline';
  showWeek?: boolean;
}

export function StreakDisplay({ variant = 'compact', showWeek = false }: StreakDisplayProps) {
  const [data, setData] = useState<{
    current: number;
    longest: number;
    lastActivityDate: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch('/api/gamification/points');
        if (response.ok) {
          const json = await response.json();
          setData(json.streak);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStreak();
  }, []);

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />;
  }

  if (!data) return null;

  const { current, longest } = data;

  // Get weekday activity (mock for now - would need to track daily activity)
  const today = new Date().getDay();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1 text-sm">
        <span className="text-orange-500">🔥</span>
        <span className="font-medium">{current}</span>
        <span className="text-muted-foreground">day streak</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-gradient-to-r from-orange-50 to-amber-50 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl">
          🔥
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">{current}</p>
          <p className="text-xs text-muted-foreground">
            {current === 1 ? 'day streak' : 'days streak'}
          </p>
        </div>
        {longest > current && (
          <div className="ml-auto text-right text-sm">
            <p className="font-medium text-muted-foreground">Best: {longest}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="text-4xl font-bold">{current}</p>
            <p className="text-orange-100">
              {current === 1 ? 'day streak' : 'days streak'}
            </p>
          </div>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Longest streak</span>
          <span className="font-semibold">{longest} days</span>
        </div>

        {showWeek && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">This week</p>
            <div className="flex justify-between gap-1">
              {weekDays.map((day, i) => {
                const isToday = i === today;
                const isActive = i <= today && current > today - i;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                        isActive
                          ? 'bg-orange-500 text-white'
                          : isToday
                          ? 'border-2 border-orange-500 text-orange-500'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isActive ? '✓' : day}
                    </div>
                    <span className={cn('text-xs', isToday ? 'font-semibold' : 'text-muted-foreground')}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {current > 0 && (
          <p className="mt-4 rounded-lg bg-orange-50 p-2 text-center text-xs text-orange-700">
            Keep it up! Learn today to maintain your streak.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface XpProgressProps {
  variant?: 'card' | 'compact' | 'inline';
  showHistory?: boolean;
}

interface PointsData {
  totalPoints: number;
  level: number;
  title: string;
  pointsToNextLevel: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string | null;
  };
  stats: {
    coursesCompleted: number;
    lessonsCompleted: number;
    quizzesPassed: number;
    badgesEarned: number;
  };
  recentHistory: Array<{
    amount: number;
    reason: string;
    source: string;
    earnedAt: string;
  }>;
}

export function XpProgress({ variant = 'card', showHistory = false }: XpProgressProps) {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch('/api/gamification/points');
        if (response.ok) {
          setData(await response.json());
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();
  }, []);

  if (loading) {
    return variant === 'inline' ? (
      <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200" />
    ) : (
      <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
    );
  }

  if (!data) return null;

  const currentLevelPoints = Math.pow(data.level - 1, 2) * 100;
  const nextLevelPoints = Math.pow(data.level, 2) * 100;
  const progressInLevel = data.totalPoints - currentLevelPoints;
  const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;
  const progressPercent = (progressInLevel / pointsNeededForLevel) * 100;

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 text-sm">
        <span className="font-medium">Lv.{data.level}</span>
        <span className="text-muted-foreground">{data.title}</span>
        <span className="text-primary font-semibold">{data.totalPoints} XP</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {data.level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{data.title}</span>
            <span className="text-muted-foreground">
              {data.totalPoints} XP
            </span>
          </div>
          <Progress value={progressPercent} className="mt-1 h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-2xl font-bold text-primary-foreground shadow-lg">
            {data.level}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{data.title}</h3>
                <p className="text-sm text-muted-foreground">Level {data.level}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{data.totalPoints.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progress to Level {data.level + 1}</span>
                <span>{progressInLevel}/{pointsNeededForLevel} XP</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 border-t pt-4">
          <StatItem label="Courses" value={data.stats.coursesCompleted} icon="📚" />
          <StatItem label="Lessons" value={data.stats.lessonsCompleted} icon="📖" />
          <StatItem label="Quizzes" value={data.stats.quizzesPassed} icon="✅" />
          <StatItem label="Badges" value={data.stats.badgesEarned} icon="🏆" />
        </div>

        {showHistory && data.recentHistory.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Recent Activity</h4>
            <div className="space-y-1">
              {data.recentHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.reason}</span>
                  <span className={cn('font-medium', item.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                    {item.amount > 0 ? '+' : ''}{item.amount} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="text-center">
      <span className="text-lg">{icon}</span>
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { BadgeCard } from './BadgeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: { url: string };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  category: string;
}

interface EarnedBadge {
  badge: Badge;
  awardedAt: string;
  isNew: boolean;
}

interface InProgressBadge {
  badge: Badge;
  current: number;
  required: number;
}

interface BadgeGridProps {
  showTabs?: boolean;
  limit?: number;
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeGrid({ showTabs = true, limit, onBadgeClick }: BadgeGridProps) {
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [inProgress, setInProgress] = useState<InProgressBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await fetch('/api/gamification/badges?markViewed=true');
        if (!response.ok) throw new Error('Failed to fetch badges');

        const data = await response.json();
        setEarned(data.earned || []);
        setInProgress(data.inProgress || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load badges');
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const displayEarned = limit ? earned.slice(0, limit) : earned;
  const displayInProgress = limit ? inProgress.slice(0, limit) : inProgress;

  const renderBadges = (
    badges: EarnedBadge[],
    progressBadges?: InProgressBadge[]
  ) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {badges.map((item) => (
        <BadgeCard
          key={item.badge.id}
          name={item.badge.name}
          description={item.badge.description}
          iconUrl={item.badge.icon?.url}
          rarity={item.badge.rarity}
          points={item.badge.points}
          isEarned
          isNew={item.isNew}
          awardedAt={item.awardedAt}
          onClick={() => onBadgeClick?.(item.badge)}
        />
      ))}
      {progressBadges?.map((item) => (
        <BadgeCard
          key={item.badge.id}
          name={item.badge.name}
          description={item.badge.description}
          iconUrl={item.badge.icon?.url}
          rarity={item.badge.rarity}
          points={item.badge.points}
          progress={{ current: item.current, required: item.required }}
          onClick={() => onBadgeClick?.(item.badge)}
        />
      ))}
    </div>
  );

  if (!showTabs) {
    return (
      <div className="space-y-6">
        {displayEarned.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">Earned Badges ({earned.length})</h3>
            {renderBadges(displayEarned)}
          </div>
        )}
        {displayInProgress.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">In Progress</h3>
            {renderBadges([], displayInProgress)}
          </div>
        )}
        {displayEarned.length === 0 && displayInProgress.length === 0 && (
          <p className="text-center text-muted-foreground">
            Complete lessons and courses to earn badges!
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span> Badges
          {earned.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-normal text-primary">
              {earned.length} earned
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="earned">
          <TabsList className="mb-4">
            <TabsTrigger value="earned">
              Earned ({earned.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              In Progress ({inProgress.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="earned">
            {displayEarned.length > 0 ? (
              renderBadges(displayEarned)
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No badges earned yet. Keep learning!
              </p>
            )}
          </TabsContent>
          <TabsContent value="progress">
            {displayInProgress.length > 0 ? (
              renderBadges([], displayInProgress)
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No badges in progress.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

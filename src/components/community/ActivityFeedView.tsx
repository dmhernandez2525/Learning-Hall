'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ActivityFeedItem } from '@/types/community';

const actionLabels: Record<string, string> = {
  enrolled: 'enrolled in',
  completed: 'completed',
  posted: 'posted in',
  reviewed: 'reviewed',
  earned_badge: 'earned badge',
};

export function ActivityFeedView() {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/community/feed');
    if (res.ok) {
      const data = await res.json();
      setActivities(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading activity feed...</p>;

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Feed</h2>
      <div className="space-y-2">
        {activities.map((a) => (
          <div key={a.id} className="rounded-lg border p-3">
            <p className="text-sm">
              <span className="font-medium">{a.userName}</span>{' '}
              {actionLabels[a.action] ?? a.action}{' '}
              <span className="font-medium">{a.targetTitle}</span>
            </p>
            <p className="text-xs text-muted-foreground">{a.targetType}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

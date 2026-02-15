'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CohortAnalytics, ModuleUnlockStatus } from '@/types/cohorts';

interface CohortAnalyticsDashboardProps {
  cohortId: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle ? (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ModuleStatusRow({ item }: { item: ModuleUnlockStatus }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          item.isUnlocked ? 'bg-green-500' : 'bg-gray-300'
        }`}
      />
      <span className="font-medium">Module {item.moduleId}</span>
      <span className="text-muted-foreground">
        {item.isUnlocked ? 'Unlocked' : 'Locked'}
      </span>
    </li>
  );
}

export function CohortAnalyticsDashboard({
  cohortId,
}: CohortAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/cohorts/${cohortId}/analytics`);
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to load analytics');
        return;
      }
      const data = (await response.json()) as { doc: CohortAnalytics };
      setAnalytics(data.doc);
    } finally {
      setIsLoading(false);
    }
  }, [cohortId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!analytics) {
    return <p className="text-sm text-muted-foreground">No analytics data available.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cohort Analytics</h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={analytics.totalMembers}
        />
        <StatCard
          label="Active Members"
          value={analytics.activeCount}
        />
        <StatCard
          label="Average Progress"
          value={`${analytics.averageProgress}%`}
        />
        <StatCard
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
        />
      </div>

      {analytics.moduleUnlockStatus.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Module Unlock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.moduleUnlockStatus.map((item) => (
                <ModuleStatusRow key={item.moduleId} item={item} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

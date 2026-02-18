'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SecurityAnalytics } from '@/types/security';

export function SecurityAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/security/analytics');
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

  const stats = [
    { label: 'SSO Providers', value: analytics.totalSSOConfigs },
    { label: 'SSO Enabled', value: analytics.enabledSSO },
    { label: 'IP Rules', value: analytics.totalIPRules },
    { label: 'Active Rules', value: analytics.activeIPRules },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Security Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Role permissions: {analytics.totalRolePermissions}
      </p>
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserManagementAnalytics } from '@/types/user-management';

export function UserManagementAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<UserManagementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/user-management/analytics');
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
    { label: 'Total Users', value: analytics.totalUsers },
    { label: 'Groups', value: analytics.totalGroups },
    { label: 'Custom Fields', value: analytics.totalCustomFields },
    { label: 'Recent Signups', value: analytics.recentSignups },
  ];

  const roleEntries = Object.entries(analytics.usersByRole);
  const maxRole = Math.max(...roleEntries.map(([, c]) => c), 1);
  const barWidth = 200;
  const barHeight = 22;
  const svgHeight = roleEntries.length * (barHeight + 8) + 16;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">User Management Analytics</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {roleEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Users by Role</h3>
          <svg width={barWidth + 120} height={svgHeight} role="img" aria-label="Users by role chart">
            {roleEntries.map(([role, count], i) => {
              const y = i * (barHeight + 8) + 8;
              const w = (count / maxRole) * barWidth;
              return (
                <g key={role}>
                  <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{role}</text>
                  <rect x={80} y={y} width={w} height={barHeight} rx={4} fill="#10b981" opacity={0.8} />
                  <text x={80 + w + 6} y={y + barHeight / 2 + 4} fontSize={12} fill="currentColor">{count}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

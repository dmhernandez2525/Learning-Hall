'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ManagerDashboardData } from '@/types/manager';

export function ManagerDashboardView() {
  const [dashboard, setDashboard] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/manager/dashboard');
    if (res.ok) {
      const data = await res.json();
      setDashboard(data.doc ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  if (!dashboard) return <p className="text-sm text-muted-foreground">No dashboard data.</p>;

  const stats = [
    { label: 'Team Size', value: dashboard.teamSize },
    { label: 'Assignments', value: dashboard.totalAssignments },
    { label: 'Completed', value: dashboard.completedAssignments },
    { label: 'Overdue', value: dashboard.overdueAssignments },
  ];

  const completionAngle = (dashboard.completionRate / 100) * 360;
  const radians = (completionAngle - 90) * (Math.PI / 180);
  const largeArc = completionAngle > 180 ? 1 : 0;
  const x = 50 + 40 * Math.cos(radians);
  const y = 50 + 40 * Math.sin(radians);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Manager Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <svg width={120} height={120} viewBox="0 0 100 100" role="img" aria-label="Completion rate">
          <circle cx={50} cy={50} r={40} fill="none" stroke="#e5e7eb" strokeWidth={8} />
          {dashboard.completionRate > 0 && (
            <path
              d={`M 50 10 A 40 40 0 ${largeArc} 1 ${x} ${y}`}
              fill="none"
              stroke="#22c55e"
              strokeWidth={8}
              strokeLinecap="round"
            />
          )}
          <text x={50} y={50} textAnchor="middle" dy={5} fontSize={16} fontWeight="bold" fill="currentColor">
            {dashboard.completionRate}%
          </text>
        </svg>
        <div>
          <p className="font-medium">Completion Rate</p>
          <p className="text-sm text-muted-foreground">
            {dashboard.completedAssignments} of {dashboard.totalAssignments} assignments completed
          </p>
        </div>
      </div>
    </div>
  );
}

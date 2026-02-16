'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TeamMemberProgress } from '@/types/manager';

export function TeamProgressView() {
  const [members, setMembers] = useState<TeamMemberProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/manager/team');
    if (res.ok) {
      const data = await res.json();
      setMembers(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTeam();
  }, [fetchTeam]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading team progress...</p>;

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No team members found.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Team Progress</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Member</th>
            <th className="pb-2 font-medium">Enrolled</th>
            <th className="pb-2 font-medium">Completed</th>
            <th className="pb-2 font-medium">Avg Progress</th>
            <th className="pb-2 font-medium">Overdue</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.userId} className="border-b">
              <td className="py-2">
                <div>{m.userName || m.userId}</div>
                <div className="text-xs text-muted-foreground">{m.userEmail}</div>
              </td>
              <td className="py-2">{m.enrolledCourses}</td>
              <td className="py-2">{m.completedCourses}</td>
              <td className="py-2">{m.averageProgress}%</td>
              <td className="py-2">
                {m.overdueAssignments > 0 ? (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                    {m.overdueAssignments}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

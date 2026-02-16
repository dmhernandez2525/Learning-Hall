'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VirtualSession } from '@/types/virtual-classroom';

const statusColors: Record<string, string> = {
  scheduled: '#3b82f6',
  live: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

export function SessionScheduler() {
  const [sessions, setSessions] = useState<VirtualSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/virtual-classroom/sessions');
    if (res.ok) {
      const data = await res.json();
      setSessions(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading sessions...</p>;

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No virtual sessions scheduled.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Virtual Sessions</h2>
      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{s.title}</h3>
              <p className="text-xs text-muted-foreground">
                {s.duration} min &middot; {s.participantCount}/{s.maxParticipants} participants
              </p>
            </div>
            <span
              className="rounded px-2 py-0.5 text-xs text-white"
              style={{ backgroundColor: statusColors[s.status] ?? '#6b7280' }}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

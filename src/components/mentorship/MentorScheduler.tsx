'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MentorshipMatch, MentorshipSession } from '@/types/mentorship';

interface MentorSchedulerProps {
  match: MentorshipMatch;
}

export function MentorScheduler({ match }: MentorSchedulerProps) {
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/mentorship/sessions?matchId=${match.id}`);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: MentorshipSession[] };
      setSessions(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [match.id]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/mentorship/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          scheduledAt,
          durationMinutes: duration,
        }),
      });
      if (response.ok) {
        setScheduledAt('');
        void fetchSessions();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionStatusStyles: Record<MentorshipSession['status'], string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
    'no-show': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Schedule New Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="flex-1 rounded-md border px-3 py-1.5 text-sm"
            />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="rounded-md border px-3 py-1.5 text-sm"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </div>
          <Button
            size="sm"
            onClick={() => void handleSchedule()}
            disabled={!scheduledAt || isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Sessions</h4>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions scheduled yet.</p>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(session.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.durationMinutes} minutes
                  </p>
                </div>
                <Badge className={sessionStatusStyles[session.status]}>
                  {session.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

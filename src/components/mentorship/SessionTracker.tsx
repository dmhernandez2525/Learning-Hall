'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MentorshipMatch } from '@/types/mentorship';

interface SessionTrackerProps {
  userId: string;
}

const matchStatusStyles: Record<MentorshipMatch['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function SessionTracker({ userId }: SessionTrackerProps) {
  const [matches, setMatches] = useState<MentorshipMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch('/api/mentorship/matches');
      if (!response.ok) return;
      const data = (await response.json()) as { docs: MentorshipMatch[] };
      setMatches(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  const handleStatusUpdate = async (matchId: string, status: MentorshipMatch['status']) => {
    const response = await fetch(`/api/mentorship/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      void fetchMatches();
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading mentorship matches...</p>;
  }

  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">No mentorship matches found.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">My Mentorships</h3>
      <div className="space-y-3">
        {matches.map((match) => {
          const isMentor = match.mentorId === userId;
          const partnerName = isMentor ? match.menteeName : match.mentorName;
          const roleLabel = isMentor ? 'Mentor' : 'Mentee';

          return (
            <Card key={match.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {partnerName || 'Unknown'} ({roleLabel})
                  </CardTitle>
                  <Badge className={matchStatusStyles[match.status]}>{match.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Matched on {new Date(match.matchedAt).toLocaleDateString()}
                </p>
                {match.status === 'pending' && isMentor && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleStatusUpdate(match.id, 'active')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleStatusUpdate(match.id, 'cancelled')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
                {match.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleStatusUpdate(match.id, 'completed')}
                  >
                    Complete Mentorship
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

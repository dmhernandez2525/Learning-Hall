'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MentorProfile } from '@/types/mentorship';

interface MentorListProps {
  onSelect?: (mentor: MentorProfile) => void;
  onRequestMatch?: (mentorProfileId: string) => void;
}

const statusStyles: Record<MentorProfile['status'], string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function MentorList({ onSelect, onRequestMatch }: MentorListProps) {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchMentors = useCallback(async () => {
    try {
      const url = filter
        ? `/api/mentors?status=active&expertise=${encodeURIComponent(filter)}`
        : '/api/mentors?status=active';
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: MentorProfile[] };
      setMentors(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchMentors();
  }, [fetchMentors]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading mentors...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Mentors</h3>
        <input
          type="text"
          placeholder="Filter by expertise..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm"
        />
      </div>

      {mentors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No mentors available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => {
            const spotsLeft = mentor.maxMentees - mentor.activeMenteeCount;
            return (
              <Card
                key={mentor.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelect?.(mentor)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{mentor.displayName}</CardTitle>
                    <Badge className={statusStyles[mentor.status]}>{mentor.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">{mentor.bio}</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} available
                    </span>
                    {onRequestMatch && spotsLeft > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestMatch(mentor.id);
                        }}
                      >
                        Request
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

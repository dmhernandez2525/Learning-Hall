'use client';

import { useState, useEffect, useCallback } from 'react';
import { SessionCard } from './SessionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Video, ArrowRight, Radio } from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'published' | 'live' | 'ended' | 'canceled';
  host?: {
    id: string;
    name?: string;
    avatar?: { url: string } | null;
  } | null;
  scheduling?: {
    scheduledAt?: string;
    duration?: number;
    timezone?: string;
  };
  settings?: {
    maxAttendees?: number;
  };
  stats?: {
    registrations?: number;
    attendees?: number;
  };
  image?: { url: string } | null;
  recording?: {
    available?: boolean;
  };
  platform?: {
    provider?: string;
  };
}

interface UpcomingSessionsProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  onRegister?: (sessionId: string) => void;
  onJoin?: (sessionId: string) => void;
}

export function UpcomingSessions({
  limit = 3,
  showViewAll = true,
  title = 'Upcoming Live Sessions',
  subtitle = 'Join live webinars and interactive sessions',
  className,
  onRegister,
  onJoin,
}: UpcomingSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveSessions, setLiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      // Fetch live sessions first
      const liveResponse = await fetch('/api/live-sessions?status=live&limit=3');
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        setLiveSessions(liveData.sessions || []);
      }

      // Fetch upcoming sessions
      const response = await fetch(`/api/live-sessions?upcoming=true&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // Silently fail for this section
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (loading) {
    return (
      <section className={cn('py-12', className)}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            {showViewAll && <Skeleton className="h-10 w-32" />}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no sessions
  if (sessions.length === 0 && liveSessions.length === 0) {
    return null;
  }

  // Combine live sessions with upcoming, prioritizing live
  const displaySessions = [...liveSessions, ...sessions].slice(0, limit);

  return (
    <section className={cn('py-12', className)}>
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {liveSessions.length > 0 ? (
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              ) : (
                <Video className="w-6 h-6 text-primary" />
              )}
              {liveSessions.length > 0 ? 'Live Now & Upcoming' : title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {showViewAll && (
            <Button variant="outline" asChild>
              <Link href="/live-sessions">
                View All Sessions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displaySessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRegister={onRegister}
              onJoin={onJoin}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

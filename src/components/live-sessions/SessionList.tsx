'use client';

import { useState, useEffect, useCallback } from 'react';
import { SessionCard } from './SessionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Video,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Radio,
  Calendar,
  History,
} from 'lucide-react';

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

interface SessionListProps {
  courseId?: string;
  limit?: number;
  showTabs?: boolean;
  showPagination?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
  onRegister?: (sessionId: string) => void;
  onJoin?: (sessionId: string) => void;
}

type FilterType = 'upcoming' | 'live' | 'past';

export function SessionList({
  courseId,
  limit = 12,
  showTabs = true,
  showPagination = true,
  columns = 3,
  className,
  onRegister,
  onJoin,
}: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      if (courseId) {
        params.set('courseId', courseId);
      }

      if (filter === 'upcoming') {
        params.set('upcoming', 'true');
      } else if (filter === 'past') {
        params.set('past', 'true');
      } else if (filter === 'live') {
        params.set('status', 'live');
      }

      const response = await fetch(`/api/live-sessions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions);
      setTotalPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);

      // Get live session count
      if (showTabs) {
        const liveResponse = await fetch('/api/live-sessions?status=live&limit=1');
        if (liveResponse.ok) {
          const liveData = await liveResponse.json();
          setLiveCount(liveData.totalDocs || 0);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [courseId, filter, limit, page, showTabs]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={className}>
        {showTabs && (
          <div className="mb-6">
            <Skeleton className="h-10 w-80" />
          </div>
        )}
        <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchSessions}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Tabs */}
      {showTabs && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Radio className="w-4 h-4" />
              Live Now
              {liveCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {liveCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <History className="w-4 h-4" />
              Past Sessions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
          <p className="text-muted-foreground">
            {filter === 'live' && 'No sessions are currently live.'}
            {filter === 'upcoming' && 'No upcoming sessions scheduled.'}
            {filter === 'past' && 'No past sessions available.'}
          </p>
        </div>
      )}

      {/* Session Grid */}
      {sessions.length > 0 && (
        <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRegister={onRegister}
              onJoin={onJoin}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1 px-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

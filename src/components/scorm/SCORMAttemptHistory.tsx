'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  History,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface SCORMAttempt {
  id: string;
  packageId: string;
  packageTitle: string | null;
  attemptNumber: number;
  status: string;
  successStatus?: string;
  score?: {
    raw?: number;
    min?: number;
    max?: number;
    scaled?: number;
  };
  progress?: number;
  totalTime?: string;
  totalTimeSeconds?: number;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  createdAt: string;
}

interface SCORMAttemptHistoryProps {
  packageId?: string;
  onLaunch?: (attemptId: string) => void;
  onResume?: (attemptId: string) => void;
  className?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'not-attempted': {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800',
    label: 'Not Started',
  },
  incomplete: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'In Progress',
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800',
    label: 'Completed',
  },
  passed: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800',
    label: 'Passed',
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800',
    label: 'Failed',
  },
  browsed: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800',
    label: 'Browsed',
  },
};

export function SCORMAttemptHistory({
  packageId,
  onLaunch,
  onResume,
  className,
}: SCORMAttemptHistoryProps) {
  const [attempts, setAttempts] = useState<SCORMAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (packageId) params.set('packageId', packageId);

      const response = await fetch(`/api/scorm/attempts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttempts(data.attempts || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreDisplay = (attempt: SCORMAttempt): string => {
    if (attempt.score?.scaled !== undefined) {
      return `${(attempt.score.scaled * 100).toFixed(0)}%`;
    }
    if (attempt.score?.raw !== undefined) {
      if (attempt.score.max !== undefined) {
        return `${attempt.score.raw}/${attempt.score.max}`;
      }
      return String(attempt.score.raw);
    }
    return '-';
  };

  const canResume = (attempt: SCORMAttempt): boolean => {
    return attempt.status === 'incomplete' || attempt.status === 'not-attempted';
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Attempt History
            </CardTitle>
            <CardDescription>Your learning progress and attempts</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchAttempts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No attempts yet</p>
            {onLaunch && (
              <Button className="mt-4" onClick={() => onLaunch('')}>
                <Play className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => {
              const config = statusConfig[attempt.status] || statusConfig['not-attempted'];

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        Attempt #{attempt.attemptNumber}
                      </span>
                      <Badge className={cn('gap-1', config.color)}>
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                    {attempt.packageTitle && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {attempt.packageTitle}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Score: {getScoreDisplay(attempt)}</span>
                      {attempt.progress !== undefined && (
                        <span>Progress: {attempt.progress.toFixed(0)}%</span>
                      )}
                      <span>Time: {formatDuration(attempt.totalTimeSeconds)}</span>
                      <span>Started: {formatDate(attempt.startedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canResume(attempt) && onResume && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResume(attempt.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    {!canResume(attempt) && onLaunch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLaunch(attempt.packageId)}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

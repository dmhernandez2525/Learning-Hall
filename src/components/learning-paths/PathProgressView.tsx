'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LearningPath, LearningPathProgress, PathStepProgress } from '@/types/learning-paths';

interface PathProgressViewProps {
  pathId: string;
}

const statusIcons: Record<string, string> = {
  locked: 'O',
  available: '>>',
  in_progress: '...',
  completed: 'V',
};

const statusColors: Record<string, string> = {
  locked: 'bg-gray-100 text-gray-500',
  available: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

function StepNode({
  step,
  path,
}: {
  step: PathStepProgress;
  path: LearningPath;
}) {
  const pathStep = path.steps.find((s) => s.stepId === step.stepId);
  const title = pathStep?.courseTitle || `Course ${step.courseId.slice(0, 8)}`;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${statusColors[step.status] ?? ''}`}
      >
        {statusIcons[step.status] ?? '?'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground capitalize">{step.status.replace('_', ' ')}</p>
      </div>
      {step.status === 'available' ? (
        <Button size="sm" variant="outline" asChild>
          <a href={`/dashboard/courses/${step.courseId}`}>Start</a>
        </Button>
      ) : null}
      {step.status === 'in_progress' ? (
        <Button size="sm" variant="outline" asChild>
          <a href={`/dashboard/courses/${step.courseId}`}>Continue</a>
        </Button>
      ) : null}
    </div>
  );
}

export function PathProgressView({ pathId }: PathProgressViewProps) {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [progress, setProgress] = useState<LearningPathProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [pathRes, progressRes] = await Promise.all([
        fetch(`/api/learning-paths/${pathId}`),
        fetch(`/api/learning-paths/${pathId}/progress`),
      ]);

      if (pathRes.ok) {
        const pathData = (await pathRes.json()) as { doc: LearningPath };
        setPath(pathData.doc);
      }

      if (progressRes.ok) {
        const progData = (await progressRes.json()) as { doc: LearningPathProgress };
        setProgress(progData.doc);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleEnroll = useCallback(async () => {
    setIsEnrolling(true);
    setError('');
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/enroll`, {
        method: 'POST',
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to enroll');
        return;
      }
      await fetchData();
    } catch {
      setError('Network error');
    } finally {
      setIsEnrolling(false);
    }
  }, [pathId, fetchData]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading path...</p>;
  }

  if (!path) {
    return <p className="text-sm text-destructive">Path not found.</p>;
  }

  const progressPercent = progress?.overallPercent ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{path.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{path.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        {!progress ? (
          <Button disabled={isEnrolling} onClick={() => void handleEnroll()}>
            {isEnrolling ? 'Enrolling...' : 'Enroll in Path'}
          </Button>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {progress.steps.map((step) => (
                <StepNode key={step.stepId} step={step} path={path} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

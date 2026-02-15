'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LearningPathSummary } from '@/types/learning-paths';

interface PathCatalogProps {
  onSelect: (path: LearningPathSummary) => void;
}

export function PathCatalog({ onSelect }: PathCatalogProps) {
  const [paths, setPaths] = useState<LearningPathSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPaths = useCallback(async () => {
    try {
      const response = await fetch('/api/learning-paths');
      if (!response.ok) return;
      const data = (await response.json()) as { docs: LearningPathSummary[] };
      setPaths(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPaths();
  }, [fetchPaths]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading learning paths...</p>;
  }

  if (paths.length === 0) {
    return <p className="text-sm text-muted-foreground">No learning paths available.</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Learning Paths</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {paths.map((path) => (
          <Card
            key={path.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onSelect(path)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{path.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {path.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{path.stepCount} courses</span>
                {path.estimatedHours > 0 ? (
                  <span>{path.estimatedHours}h estimated</span>
                ) : null}
                <span>{path.enrollmentCount} enrolled</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

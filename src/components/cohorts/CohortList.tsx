'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Cohort } from '@/types/cohorts';

interface CohortListProps {
  courseId: string;
  onSelect?: (cohort: Cohort) => void;
}

const statusStyles: Record<Cohort['status'], string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CohortList({ courseId, onSelect }: CohortListProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCohorts = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/cohorts`);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: Cohort[] };
      setCohorts(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchCohorts();
  }, [fetchCohorts]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading cohorts...</p>;
  }

  if (cohorts.length === 0) {
    return <p className="text-sm text-muted-foreground">No cohorts available for this course.</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Cohorts</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {cohorts.map((cohort) => (
          <Card
            key={cohort.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onSelect?.(cohort)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{cohort.title}</CardTitle>
                <Badge className={statusStyles[cohort.status]}>
                  {cohort.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                <span>{formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{cohort.memberCount} / {cohort.maxMembers} members</span>
                <span>{cohort.dripSchedule.length} scheduled modules</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Assignment } from '@/types/assignments';

interface AssignmentListProps {
  courseId: string;
  isInstructor: boolean;
  onSelect: (assignment: Assignment) => void;
  onCreateNew?: () => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
};

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'No due date';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AssignmentList({
  courseId,
  isInstructor,
  onSelect,
  onCreateNew,
}: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments`);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: Assignment[] };
      setAssignments(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading assignments...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assignments</h3>
        {isInstructor && onCreateNew ? (
          <Button size="sm" onClick={onCreateNew}>New Assignment</Button>
        ) : null}
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments available.</p>
      ) : (
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onSelect(assignment)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{assignment.title}</CardTitle>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[assignment.status] ?? ''}`}>
                    {statusLabels[assignment.status] ?? assignment.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Due: {formatDate(assignment.dueDate)}</span>
                  <span>Max: {assignment.maxScore} pts</span>
                  {assignment.rubric.length > 0 ? (
                    <span>{assignment.rubric.length} criteria</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

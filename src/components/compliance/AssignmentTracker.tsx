'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ComplianceAssignment } from '@/types/compliance';

const statusStyles: Record<ComplianceAssignment['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export function AssignmentTracker() {
  const [assignments, setAssignments] = useState<ComplianceAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch('/api/compliance/assignments');
      if (!response.ok) return;
      const data = (await response.json()) as { docs: ComplianceAssignment[] };
      setAssignments(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  const handleComplete = async (assignmentId: string) => {
    const response = await fetch(`/api/compliance/assignments/${assignmentId}/complete`, {
      method: 'POST',
    });
    if (response.ok) {
      void fetchAssignments();
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading assignments...</p>;
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-muted-foreground">No compliance assignments.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">My Compliance Assignments</h3>
      <div className="space-y-2">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">
                  Requirement: {assignment.requirementId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusStyles[assignment.status]}>
                  {assignment.status.replace('_', ' ')}
                </Badge>
                {assignment.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleComplete(assignment.id)}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

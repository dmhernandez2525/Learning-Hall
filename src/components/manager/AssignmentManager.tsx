'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TrainingAssignment } from '@/types/manager';

export function AssignmentManager() {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/manager/assignments');
    if (res.ok) {
      const data = await res.json();
      setAssignments(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading assignments...</p>;

  const statusColors: Record<string, string> = {
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Training Assignments</h2>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No training assignments.</p>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{a.courseName || a.courseId}</h3>
                  <p className="text-xs text-muted-foreground">
                    Assigned to: {a.userName || a.userId}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs ${statusColors[a.status] ?? ''}`}>
                  {a.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                <span>Progress: {a.progressPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

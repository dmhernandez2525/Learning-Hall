'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ComplianceRequirement } from '@/types/compliance';

interface RequirementListProps {
  orgId?: string;
  onSelect?: (req: ComplianceRequirement) => void;
}

const statusStyles: Record<ComplianceRequirement['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  archived: 'bg-yellow-100 text-yellow-700',
};

export function RequirementList({ orgId, onSelect }: RequirementListProps) {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequirements = useCallback(async () => {
    try {
      const url = orgId
        ? `/api/compliance/requirements?orgId=${orgId}`
        : '/api/compliance/requirements';
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as { docs: ComplianceRequirement[] };
      setRequirements(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void fetchRequirements();
  }, [fetchRequirements]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading requirements...</p>;
  }

  if (requirements.length === 0) {
    return <p className="text-sm text-muted-foreground">No compliance requirements found.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Compliance Requirements</h3>
      <div className="space-y-3">
        {requirements.map((req) => {
          const progressPercent = req.assigneeCount > 0
            ? Math.round((req.completionCount / req.assigneeCount) * 100)
            : 0;
          const isOverdue = new Date(req.dueDate) < new Date() && progressPercent < 100;

          return (
            <Card
              key={req.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect?.(req)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{req.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={statusStyles[req.status]}>{req.status}</Badge>
                    {isOverdue && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(req.dueDate).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {req.completionCount}/{req.assigneeCount}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

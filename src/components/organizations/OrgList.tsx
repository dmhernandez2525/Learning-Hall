'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Organization } from '@/types/organizations';

interface OrgListProps {
  onSelect?: (org: Organization) => void;
}

const statusStyles: Record<Organization['status'], string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function OrgList({ onSelect }: OrgListProps) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) return;
      const data = (await response.json()) as { docs: Organization[] };
      setOrgs(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrgs();
  }, [fetchOrgs]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading organizations...</p>;
  }

  if (orgs.length === 0) {
    return <p className="text-sm text-muted-foreground">No organizations found.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Organizations</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((org) => (
          <Card
            key={org.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect?.(org)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm">{org.name}</CardTitle>
                <Badge className={statusStyles[org.status]}>{org.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {org.description || 'No description'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

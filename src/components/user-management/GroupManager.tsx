'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserGroup } from '@/types/user-management';

interface GroupManagerProps {
  organizationId?: string;
}

export function GroupManager({ organizationId }: GroupManagerProps) {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (organizationId) params.set('organizationId', organizationId);
    const res = await fetch(`/api/user-management/groups?${params}`);
    if (res.ok) {
      const data = await res.json();
      setGroups(data.docs ?? []);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading groups...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">User Groups</h2>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No groups found.</p>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{g.name}</h3>
                <p className="text-xs text-muted-foreground">{g.description}</p>
              </div>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                {g.memberCount} members
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

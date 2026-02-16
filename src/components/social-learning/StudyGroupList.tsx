'use client';

import { useState, useCallback, useEffect } from 'react';
import type { StudyGroup } from '@/types/social-learning';

export function StudyGroupList() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/social-learning/study-groups');
    if (res.ok) {
      const data = await res.json();
      setGroups(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading study groups...</p>;

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">No study groups yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Study Groups</h2>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{g.name}</h3>
              <p className="text-xs text-muted-foreground">
                {g.memberCount}/{g.maxMembers} members
              </p>
            </div>
            <span className={`rounded px-2 py-0.5 text-xs ${g.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {g.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

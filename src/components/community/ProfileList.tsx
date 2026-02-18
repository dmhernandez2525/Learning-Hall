'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserProfile } from '@/types/community';

export function ProfileList() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/community/profiles?publicOnly=true');
    if (res.ok) {
      const data = await res.json();
      setProfiles(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProfiles();
  }, [fetchProfiles]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading profiles...</p>;

  if (profiles.length === 0) {
    return <p className="text-sm text-muted-foreground">No community profiles yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Community Members</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {profiles.map((p) => (
          <div key={p.id} className="rounded-lg border p-3 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-secondary" />
            <h3 className="font-medium">{p.displayName}</h3>
            {p.bio && <p className="text-xs text-muted-foreground line-clamp-2">{p.bio}</p>}
            {p.interests.length > 0 && (
              <div className="mt-1 flex flex-wrap justify-center gap-1">
                {p.interests.slice(0, 3).map((interest) => (
                  <span key={interest} className="rounded bg-secondary px-1.5 py-0.5 text-xs">{interest}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

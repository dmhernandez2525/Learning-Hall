'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ContentVersion } from '@/types/content-library';

interface VersionHistoryProps {
  contentItemId: string;
}

export function VersionHistory({ contentItemId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/content-library/items/${contentItemId}/versions`);
    if (res.ok) {
      const data = await res.json();
      setVersions(data.docs ?? []);
    }
    setLoading(false);
  }, [contentItemId]);

  useEffect(() => {
    void fetchVersions();
  }, [fetchVersions]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading versions...</p>;

  if (versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No versions yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Version History</h2>
      <div className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <span className="font-medium">v{v.versionNumber}</span>
              {v.changelog && (
                <p className="text-xs text-muted-foreground">{v.changelog}</p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(v.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SavedSearch } from '@/types/advanced-search';

export function SavedSearchList() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/advanced-search/saved-searches');
    if (res.ok) {
      const data = await res.json();
      setSearches(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSearches();
  }, [fetchSearches]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading saved searches...</p>;

  if (searches.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved searches yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Saved Searches</h2>
      <div className="space-y-2">
        {searches.map((s) => (
          <div key={s.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{s.name}</h3>
              <p className="text-xs text-muted-foreground">
                Query: &quot;{s.query}&quot; &middot; {s.resultCount} results
              </p>
            </div>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs">
              {s.filters.length} filters
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

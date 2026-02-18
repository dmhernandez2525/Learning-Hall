'use client';

import { useState, useCallback } from 'react';
import type { SearchResult } from '@/types/advanced-search';

const typeColors: Record<string, string> = {
  course: '#3b82f6',
  lesson: '#10b981',
  discussion: '#f59e0b',
  user: '#8b5cf6',
};

export function SearchInterface() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/advanced-search/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Advanced Search</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem('query') as HTMLInputElement;
          void handleSearch(input.value);
        }}
        className="flex gap-2"
      >
        <input
          name="query"
          type="text"
          placeholder="Search courses, lessons, discussions..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
          Search
        </button>
      </form>

      {loading && <p className="text-sm text-muted-foreground">Searching...</p>}

      {searched && !loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No results found.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={`${r.type}-${r.id}`} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="rounded px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: typeColors[r.type] ?? '#6b7280' }}
                >
                  {r.type}
                </span>
                <h3 className="font-medium">{r.title}</h3>
              </div>
              {r.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

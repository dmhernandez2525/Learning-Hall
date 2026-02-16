'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ContentSuggestion } from '@/types/ai-content';

interface SuggestionListProps {
  lessonId?: string;
}

const typeColors: Record<string, string> = {
  topic: '#3b82f6',
  example: '#10b981',
  exercise: '#f59e0b',
  explanation: '#8b5cf6',
};

export function SuggestionList({ lessonId }: SuggestionListProps) {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (lessonId) params.set('lessonId', lessonId);
    const res = await fetch(`/api/ai-content/suggestions?${params}`);
    if (res.ok) {
      const data = await res.json();
      setSuggestions(data.docs ?? []);
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    void fetchSuggestions();
  }, [fetchSuggestions]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading suggestions...</p>;

  if (suggestions.length === 0) {
    return <p className="text-sm text-muted-foreground">No content suggestions yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Content Suggestions</h2>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <div key={s.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">{s.title}</h3>
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: typeColors[s.type] ?? '#6b7280' }}
                >
                  {s.type}
                </span>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">{s.status}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { MicroLesson } from '@/types/microlearning';

const statusColors: Record<string, string> = { draft: '#6b7280', published: '#10b981' };

export function MicroLessonList() {
  const [lessons, setLessons] = useState<MicroLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/microlearning/micro-lessons');
    if (res.ok) {
      const data = await res.json();
      setLessons(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchLessons();
  }, [fetchLessons]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading micro lessons...</p>;

  if (lessons.length === 0) {
    return <p className="text-sm text-muted-foreground">No micro lessons yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Micro Lessons</h2>
      <div className="space-y-2">
        {lessons.map((l) => (
          <div key={l.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{l.title}</p>
              <p className="text-xs text-muted-foreground">{l.durationMinutes} min</p>
            </div>
            <span
              className="rounded px-2 py-0.5 text-xs text-white"
              style={{ backgroundColor: statusColors[l.status] ?? '#6b7280' }}
            >
              {l.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

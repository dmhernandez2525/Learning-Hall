'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CollaborativeNote } from '@/types/social-learning';

interface CollaborativeNotepadProps {
  groupId: string;
}

export function CollaborativeNotepad({ groupId }: CollaborativeNotepadProps) {
  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/social-learning/study-groups/${groupId}/notes`);
    if (res.ok) {
      const data = await res.json();
      setNotes(data.docs ?? []);
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading notes...</p>;

  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">No collaborative notes yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Collaborative Notes</h2>
      <div className="space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">{n.title}</h3>
              <span className="text-xs text-muted-foreground">by {n.authorName}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatTime } from './VideoControlsBar';

interface VideoBookmark {
  id: string;
  videoTimestamp?: number;
  note?: string;
  createdAt: string;
}

interface VideoBookmarksPanelProps {
  lessonId: string;
  currentTime: number;
  onSeek: (timestamp: number) => void;
}

export function VideoBookmarksPanel({
  lessonId,
  currentTime,
  onSeek,
}: VideoBookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<VideoBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/bookmarks`);
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { docs: VideoBookmark[] };
      setBookmarks(data.docs);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  const handleCreate = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Math.floor(currentTime),
          note: note.trim() || undefined,
        }),
      });

      if (!response.ok) {
        return;
      }

      setNote('');
      await fetchBookmarks();
    } finally {
      setIsSaving(false);
    }
  }, [lessonId, currentTime, note, fetchBookmarks]);

  const handleDelete = useCallback(async (bookmarkId: string) => {
    const response = await fetch(`/api/lessons/${lessonId}/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
    }
  }, [lessonId]);

  if (isLoading) {
    return (
      <div className="rounded-md border p-3">
        <p className="text-sm text-muted-foreground">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3 space-y-3">
      <h4 className="text-sm font-medium">Video Bookmarks</h4>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">
            Note (optional)
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
            placeholder="Add a note..."
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <Button
          size="sm"
          disabled={isSaving}
          onClick={() => void handleCreate()}
        >
          Bookmark at {formatTime(currentTime)}
        </Button>
      </div>

      {bookmarks.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No bookmarks yet. Add one at the current video position.
        </p>
      ) : (
        <ul className="space-y-1">
          {bookmarks.map((bm) => (
            <li key={bm.id} className="flex items-center gap-2 rounded-md bg-muted/30 px-2 py-1.5 text-sm">
              <button
                className="font-mono text-xs text-primary underline-offset-2 hover:underline"
                onClick={() => bm.videoTimestamp != null && onSeek(bm.videoTimestamp)}
              >
                {bm.videoTimestamp != null ? formatTime(bm.videoTimestamp) : '--:--'}
              </button>
              <span className="flex-1 truncate text-muted-foreground">
                {bm.note || 'No note'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1 text-destructive"
                onClick={() => void handleDelete(bm.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import type { VideoChapter } from '@/types/video-learning';
import { formatTime } from './VideoControlsBar';

interface ChaptersListProps {
  chapters: VideoChapter[];
  currentTime: number;
  onSeek: (timestamp: number) => void;
}

export function ChaptersList({ chapters, currentTime, onSeek }: ChaptersListProps) {
  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <h4 className="mb-2 text-sm font-medium">Chapters</h4>
      <div className="flex flex-wrap gap-2">
        {chapters.map((chapter) => (
          <Button
            key={chapter.id}
            size="sm"
            variant={currentTime >= chapter.timestamp ? 'default' : 'outline'}
            onClick={() => onSeek(chapter.timestamp)}
          >
            {chapter.title} ({formatTime(chapter.timestamp)})
          </Button>
        ))}
      </div>
    </div>
  );
}

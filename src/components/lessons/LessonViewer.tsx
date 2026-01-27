'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/video';
import { LessonNotesPanel } from '@/components/notes/LessonNotesPanel';
import type { LessonNote } from '@/lib/notes';
import { Card, CardContent } from '@/components/ui/card';

interface LessonViewerProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  videoUrl?: string;
  posterUrl?: string;
  textContent?: string;
  initialNotes: LessonNote[];
}

export function LessonViewer({
  lessonId,
  courseId,
  lessonTitle,
  videoUrl,
  posterUrl,
  textContent,
  initialNotes,
}: LessonViewerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);

  return (
    <div className="space-y-6">
      {videoUrl ? (
        <Card>
          <CardContent className="p-4">
            <VideoPlayer
              src={videoUrl}
              poster={posterUrl}
              title={lessonTitle}
              onProgress={(progress) => setCurrentTime(progress.currentTime)}
              seekTimestamp={seekTime}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">No video is attached to this lesson.</p>
          </CardContent>
        </Card>
      )}

      {textContent && (
        <Card>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: textContent }} />
        </Card>
      )}

      <LessonNotesPanel
        courseId={courseId}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        initialNotes={initialNotes}
        currentVideoTime={currentTime}
        onSeek={(seconds) => setSeekTime(seconds)}
      />
    </div>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TranscriptPanelProps {
  lessonId: string;
  transcriptVtt: string;
  isInstructor: boolean;
  onTranscriptSaved?: (vtt: string) => void;
}

interface VttCue {
  start: string;
  end: string;
  text: string;
}

function parseVttCues(vtt: string): VttCue[] {
  if (!vtt.trim()) {
    return [];
  }

  const cues: VttCue[] = [];
  const blocks = vtt.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const timeLine = lines.find((line) => line.includes('-->'));
    if (!timeLine) {
      continue;
    }

    const [start, end] = timeLine.split('-->').map((segment) => segment.trim());
    const textIndex = lines.indexOf(timeLine) + 1;
    const text = lines.slice(textIndex).join(' ').trim();

    if (start && end && text) {
      cues.push({ start, end, text });
    }
  }

  return cues;
}

export function TranscriptPanel({
  lessonId,
  transcriptVtt,
  isInstructor,
  onTranscriptSaved,
}: TranscriptPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(transcriptVtt);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const cues = parseVttCues(transcriptVtt);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/lessons/${lessonId}/video-metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptVtt: editValue }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? 'Failed to save transcript');
        return;
      }

      setIsEditing(false);
      onTranscriptSaved?.(editValue);
    } catch {
      setError('Network error saving transcript');
    } finally {
      setIsSaving(false);
    }
  }, [lessonId, editValue, onTranscriptSaved]);

  return (
    <div className="rounded-md border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Transcript</h4>
        {isInstructor && !isEditing ? (
          <Button size="sm" variant="outline" onClick={() => {
            setEditValue(transcriptVtt);
            setIsEditing(true);
          }}>
            Edit VTT
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs"
            rows={12}
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
            placeholder="WEBVTT&#10;&#10;00:00:00.000 --> 00:00:05.000&#10;Welcome to this lesson."
          />
          <div className="flex gap-2">
            <Button size="sm" disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : cues.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {isInstructor
            ? 'No transcript available. Click "Edit VTT" to add one.'
            : 'No transcript available for this video.'}
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1.5">
          {cues.map((cue, index) => (
            <div key={index} className="flex gap-2 text-sm">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {cue.start.split('.')[0]}
              </span>
              <span>{cue.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

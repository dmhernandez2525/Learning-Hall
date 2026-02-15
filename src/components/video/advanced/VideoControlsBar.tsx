'use client';

import { Button } from '@/components/ui/button';
import type { VideoQualityOption } from '@/types/video-learning';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function formatTime(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface VideoControlsBarProps {
  playbackRate: number;
  onPlaybackRateChange?: (rate: number) => void;
  qualityOptions: VideoQualityOption[];
  selectedQualityId: string;
  onQualityChange: (id: string) => void;
  isPiPActive: boolean;
  onPiPToggle: () => void;
  currentTime: number;
  duration: number;
}

export function VideoControlsBar({
  playbackRate,
  onPlaybackRateChange,
  qualityOptions,
  selectedQualityId,
  onQualityChange,
  isPiPActive,
  onPiPToggle,
  currentTime,
  duration,
}: VideoControlsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm">
        Speed
        <select
          className="ml-2 rounded-md border bg-background px-2 py-1 text-sm"
          value={playbackRate}
          onChange={(event) => onPlaybackRateChange?.(Number(event.target.value))}
        >
          {SPEED_OPTIONS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Quality
        <select
          className="ml-2 rounded-md border bg-background px-2 py-1 text-sm"
          value={selectedQualityId || qualityOptions[0]?.id}
          onChange={(event) => onQualityChange(event.target.value)}
        >
          {qualityOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Button size="sm" variant="outline" onClick={onPiPToggle}>
        {isPiPActive ? 'Exit PiP' : 'Picture in Picture'}
      </Button>
      <span className="text-xs text-muted-foreground">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

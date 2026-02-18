'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  VideoAnnotation,
  VideoChapter,
  VideoHotspot,
  VideoQualityOption,
} from '@/types/video-learning';
import { VideoControlsBar } from './VideoControlsBar';
import { VideoOverlays } from './VideoOverlays';
import { ChaptersList } from './ChaptersList';

interface AdvancedVideoProgress {
  currentTime: number;
  duration: number;
  percentage: number;
  isComplete: boolean;
}

export interface AdvancedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  startTime?: number;
  chapters?: VideoChapter[];
  hotspots?: VideoHotspot[];
  annotations?: VideoAnnotation[];
  captionsVtt?: string;
  qualityOptions?: VideoQualityOption[];
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
  onProgress?: (progress: AdvancedVideoProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function AdvancedVideoPlayer({
  src,
  poster,
  title,
  startTime = 0,
  chapters = [],
  hotspots = [],
  annotations = [],
  captionsVtt = '',
  qualityOptions = [],
  playbackRate = 1,
  onPlaybackRateChange,
  onProgress,
  onComplete,
  onError,
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const appliedSourceRef = useRef<string>('');
  const progressTsRef = useRef<number>(0);
  const completedRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQualityId, setSelectedQualityId] = useState<string>('');
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [captionTrackUrl, setCaptionTrackUrl] = useState<string>('');

  const normalizedQualityOptions = useMemo(() => {
    if (qualityOptions.length === 0) {
      return [{ id: 'default', label: 'Auto', url: src }] as VideoQualityOption[];
    }
    return qualityOptions;
  }, [qualityOptions, src]);

  const activeSource = useMemo(() => {
    if (!selectedQualityId) {
      return normalizedQualityOptions[0]?.url ?? src;
    }
    return normalizedQualityOptions.find((option) => option.id === selectedQualityId)?.url ?? src;
  }, [normalizedQualityOptions, selectedQualityId, src]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || Number.isNaN(video.duration) || video.duration <= 0) {
      return;
    }

    const progress: AdvancedVideoProgress = {
      currentTime: video.currentTime,
      duration: video.duration,
      percentage: (video.currentTime / video.duration) * 100,
      isComplete: video.currentTime >= video.duration * 0.9,
    };

    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    if (progress.isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }

    const now = Date.now();
    if (now - progressTsRef.current >= 1000) {
      progressTsRef.current = now;
      onProgress?.(progress);
    }
  }, [onComplete, onProgress]);

  const handlePiPToggle = useCallback(async () => {
    const video = videoRef.current as (HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<unknown>;
    }) | null;
    if (!video) {
      return;
    }

    if (!('pictureInPictureEnabled' in document)) {
      onError?.('Picture-in-picture is not supported in this browser');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch {
      onError?.('Unable to toggle picture-in-picture');
    }
  }, [onError]);

  const seekToTimestamp = useCallback((timestamp: number) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.currentTime = timestamp;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (appliedSourceRef.current === activeSource) {
      return;
    }

    const resumeFrom = video.currentTime;
    const wasPlaying = !video.paused;
    appliedSourceRef.current = activeSource;
    video.src = activeSource;
    video.load();

    const onLoadedMetadata = () => {
      const seekTarget = resumeFrom > 0 ? resumeFrom : startTime;
      if (seekTarget > 0) {
        video.currentTime = Math.min(seekTarget, video.duration || seekTarget);
      }
      video.playbackRate = playbackRate;
      if (wasPlaying) {
        void video.play().catch(() => undefined);
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
  }, [activeSource, playbackRate, startTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!captionsVtt.trim()) {
      setCaptionTrackUrl('');
      return;
    }
    const blob = new Blob([captionsVtt], { type: 'text/vtt' });
    const objectUrl = URL.createObjectURL(blob);
    setCaptionTrackUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [captionsVtt]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border bg-black">
        <video
          ref={videoRef}
          src={activeSource}
          poster={poster}
          controls
          className="w-full"
          onTimeUpdate={handleTimeUpdate}
          onError={() => onError?.('Failed to load video')}
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (!video) {
              return;
            }
            if (startTime > 0) {
              video.currentTime = Math.min(startTime, video.duration || startTime);
            }
            setDuration(video.duration || 0);
          }}
        >
          {captionTrackUrl ? (
            <track kind="captions" label="English" srcLang="en" src={captionTrackUrl} default />
          ) : null}
        </video>

        <VideoOverlays
          annotations={annotations}
          hotspots={hotspots}
          currentTime={currentTime}
        />
      </div>

      <VideoControlsBar
        playbackRate={playbackRate}
        onPlaybackRateChange={onPlaybackRateChange}
        qualityOptions={normalizedQualityOptions}
        selectedQualityId={selectedQualityId}
        onQualityChange={setSelectedQualityId}
        isPiPActive={isPiPActive}
        onPiPToggle={() => void handlePiPToggle()}
        currentTime={currentTime}
        duration={duration}
      />

      <ChaptersList
        chapters={chapters}
        currentTime={currentTime}
        onSeek={seekToTimestamp}
      />
    </div>
  );
}

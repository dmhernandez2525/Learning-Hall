'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  onProgress?: (progress: VideoProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  startTime?: number;
  className?: string;
  seekTimestamp?: number;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  percentage: number;
  isComplete: boolean;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  onProgress,
  onComplete,
  onError,
  startTime = 0,
  className = '',
  seekTimestamp,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProgressCallRef = useRef<number>(0);
  const PROGRESS_THROTTLE_MS = 1000; // Only call onProgress once per second
  const lastSeekRequestRef = useRef<number | null>(null);

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => {
        console.error('Play error:', err);
        onError?.('Failed to play video');
      });
    } else {
      video.pause();
    }
  }, [onError]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Set volume
  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = Math.max(0, Math.min(1, newVolume));
    setVolume(video.volume);
    setIsMuted(video.volume === 0);
  }, []);

  // Seek to position
  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(time, video.duration));
  }, []);

  // Handle progress bar click
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect || !duration) return;

      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      seekTo(percentage * duration);
    },
    [duration, seekTo]
  );

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  // Change playback rate
  const changePlaybackRate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];

    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  }, [playbackRate]);

  // Skip forward/backward
  const skip = useCallback(
    (seconds: number) => {
      seekTo(currentTime + seconds);
    },
    [currentTime, seekTo]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if video player is focused
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case ',':
          e.preventDefault();
          changePlaybackRate();
          break;
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          seekTo((parseInt(e.key) / 10) * duration);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    skip,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    changePlaybackRate,
    volume,
    duration,
    seekTo,
  ]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      const progress: VideoProgress = {
        currentTime: video.currentTime,
        duration: video.duration,
        percentage: (video.currentTime / video.duration) * 100,
        isComplete: video.currentTime >= video.duration * 0.9,
      };

      // Throttle onProgress calls to once per second to reduce re-renders
      const now = Date.now();
      if (now - lastProgressCallRef.current >= PROGRESS_THROTTLE_MS) {
        lastProgressCallRef.current = now;
        onProgress?.(progress);
      }

      // Mark as complete when 90% watched
      if (progress.isComplete && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      onError?.('Failed to load video');
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [startTime, onProgress, onComplete, onError, hasCompleted]);

  useEffect(() => {
    if (typeof seekTimestamp !== 'number') return;
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, seekTimestamp);
    if (lastSeekRequestRef.current === target) return;
    if (!Number.isNaN(video.duration) && video.duration > 0) {
      video.currentTime = Math.min(target, video.duration);
    } else {
      video.currentTime = target;
    }
    lastSeekRequestRef.current = target;
  }, [seekTimestamp]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-primary rounded-full relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full scale-0 group-hover/progress:scale-100 transition-transform" />
          </div>
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </Button>

            {/* Skip backward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </Button>

            {/* Skip forward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </Button>

            {/* Volume */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </Button>

            {/* Time */}
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Rate */}
            <Button
              variant="ghost"
              size="sm"
              onClick={changePlaybackRate}
              className="text-white hover:bg-white/20 px-2 h-8 text-sm"
            >
              {playbackRate}x
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Center Play Button (when paused) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}

export default VideoPlayer;

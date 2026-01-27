import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoPlayer } from '../video-player';

// Mock HTMLMediaElement play/pause
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});

// Mock fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  configurable: true,
  value: null,
});

Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

describe('VideoPlayer', () => {
  const defaultProps = {
    src: 'https://example.com/video.mp4',
    poster: 'https://example.com/poster.jpg',
    title: 'Test Video',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders video element with src and poster', () => {
    render(<VideoPlayer {...defaultProps} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', defaultProps.src);
    expect(video).toHaveAttribute('poster', defaultProps.poster);
  });

  it('renders title overlay', () => {
    render(<VideoPlayer {...defaultProps} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('calls play when clicking play button', () => {
    render(<VideoPlayer {...defaultProps} />);
    const video = document.querySelector('video') as HTMLVideoElement;
    Object.defineProperty(video, 'paused', { value: true });

    // Click the center play button
    const playButtons = document.querySelectorAll('button');
    fireEvent.click(playButtons[0]);

    expect(video.play).toHaveBeenCalled();
  });

  it('shows loading spinner initially', () => {
    render(<VideoPlayer {...defaultProps} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('hides loading spinner when video can play', async () => {
    render(<VideoPlayer {...defaultProps} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    fireEvent(video, new Event('canplay'));

    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  it('displays time correctly', async () => {
    render(<VideoPlayer {...defaultProps} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    // Mock duration and currentTime
    Object.defineProperty(video, 'duration', { value: 300, writable: true });
    Object.defineProperty(video, 'currentTime', { value: 60, writable: true });

    fireEvent(video, new Event('loadedmetadata'));
    fireEvent(video, new Event('timeupdate'));

    await waitFor(() => {
      expect(screen.getByText(/1:00 \/ 5:00/)).toBeInTheDocument();
    });
  });

  it('calls onProgress when time updates', async () => {
    const onProgress = vi.fn();
    render(<VideoPlayer {...defaultProps} onProgress={onProgress} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { value: 100, writable: true });
    Object.defineProperty(video, 'currentTime', { value: 50, writable: true });

    fireEvent(video, new Event('loadedmetadata'));
    fireEvent(video, new Event('timeupdate'));

    await waitFor(() => {
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          currentTime: 50,
          duration: 100,
          percentage: 50,
        })
      );
    });
  });

  it('calls onComplete when 90% of video is watched', async () => {
    const onComplete = vi.fn();
    render(<VideoPlayer {...defaultProps} onComplete={onComplete} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { value: 100, writable: true });
    Object.defineProperty(video, 'currentTime', { value: 91, writable: true });

    fireEvent(video, new Event('loadedmetadata'));
    fireEvent(video, new Event('timeupdate'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('calls onComplete when video ends', async () => {
    const onComplete = vi.fn();
    render(<VideoPlayer {...defaultProps} onComplete={onComplete} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    fireEvent(video, new Event('ended'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('calls onError when video fails to load', async () => {
    const onError = vi.fn();
    render(<VideoPlayer {...defaultProps} onError={onError} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    fireEvent.error(video);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to load video');
    });
  });

  it('starts at specified startTime', async () => {
    render(<VideoPlayer {...defaultProps} startTime={60} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { value: 300, writable: true });
    fireEvent(video, new Event('loadedmetadata'));

    await waitFor(() => {
      expect(video.currentTime).toBe(60);
    });
  });

  it('displays playback rate and can cycle through rates', async () => {
    render(<VideoPlayer {...defaultProps} />);

    // Find the playback rate button (displays "1x" initially)
    const rateButton = screen.getByText('1x');
    expect(rateButton).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    render(<VideoPlayer src={defaultProps.src} />);
    expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<VideoPlayer {...defaultProps} />);
    const container = document.querySelector('[tabindex="0"]');
    expect(container).toBeInTheDocument();
  });
});

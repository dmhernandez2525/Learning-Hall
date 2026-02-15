import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedVideoPlayer } from '../advanced/AdvancedVideoPlayer';

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
});

describe('AdvancedVideoPlayer', () => {
  const defaultProps = {
    src: 'https://example.com/video.mp4',
    poster: 'https://example.com/poster.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
    URL.revokeObjectURL = vi.fn();
  });

  it('renders video element with correct source', () => {
    render(<AdvancedVideoPlayer {...defaultProps} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', defaultProps.src);
    expect(video).toHaveAttribute('poster', defaultProps.poster);
  });

  it('renders speed and quality controls', () => {
    render(<AdvancedVideoPlayer {...defaultProps} />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
  });

  it('renders PiP button', () => {
    render(<AdvancedVideoPlayer {...defaultProps} />);
    expect(screen.getByText('Picture in Picture')).toBeInTheDocument();
  });

  it('renders chapter navigation when chapters provided', () => {
    const chapters = [
      { id: 'ch1', title: 'Introduction', timestamp: 0 },
      { id: 'ch2', title: 'Main Content', timestamp: 120 },
    ];
    render(<AdvancedVideoPlayer {...defaultProps} chapters={chapters} />);
    expect(screen.getByText('Chapters')).toBeInTheDocument();
    expect(screen.getByText(/Introduction/)).toBeInTheDocument();
    expect(screen.getByText(/Main Content/)).toBeInTheDocument();
  });

  it('does not render chapters section when no chapters', () => {
    render(<AdvancedVideoPlayer {...defaultProps} />);
    expect(screen.queryByText('Chapters')).not.toBeInTheDocument();
  });

  it('displays annotations at the correct time', () => {
    const annotations = [
      { id: 'a1', text: 'Important note', timestamp: 5, duration: 10 },
    ];
    render(<AdvancedVideoPlayer {...defaultProps} annotations={annotations} />);
    // Initially at time 0, annotation should not show
    expect(screen.queryByText('Important note')).not.toBeInTheDocument();
  });

  it('displays correct time format', () => {
    render(<AdvancedVideoPlayer {...defaultProps} />);
    expect(screen.getByText('0:00 / 0:00')).toBeInTheDocument();
  });

  it('calls onComplete when 90% watched', async () => {
    const onComplete = vi.fn();
    render(<AdvancedVideoPlayer {...defaultProps} onComplete={onComplete} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { value: 100, writable: true });
    Object.defineProperty(video, 'currentTime', { value: 91, writable: true });

    fireEvent(video, new Event('timeupdate'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('calls onError when video fails to load', async () => {
    const onError = vi.fn();
    render(<AdvancedVideoPlayer {...defaultProps} onError={onError} />);
    const video = document.querySelector('video') as HTMLVideoElement;

    fireEvent.error(video);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to load video');
    });
  });

  it('creates captions track when captionsVtt provided', () => {
    const vtt = 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello world';
    render(<AdvancedVideoPlayer {...defaultProps} captionsVtt={vtt} />);

    const track = document.querySelector('track');
    expect(track).toBeInTheDocument();
    expect(track).toHaveAttribute('kind', 'captions');
    expect(track).toHaveAttribute('srclang', 'en');
  });

  it('does not create track when captionsVtt is empty', () => {
    render(<AdvancedVideoPlayer {...defaultProps} captionsVtt="" />);
    const track = document.querySelector('track');
    expect(track).not.toBeInTheDocument();
  });

  it('renders quality options', () => {
    const qualityOptions = [
      { id: 'q1', label: '720p', url: 'https://example.com/720.mp4' },
      { id: 'q2', label: '1080p', url: 'https://example.com/1080.mp4' },
    ];
    render(<AdvancedVideoPlayer {...defaultProps} qualityOptions={qualityOptions} />);
    expect(screen.getByText('720p')).toBeInTheDocument();
    expect(screen.getByText('1080p')).toBeInTheDocument();
  });

  it('defaults to Auto quality when no options provided', () => {
    render(<AdvancedVideoPlayer {...defaultProps} />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
  });
});

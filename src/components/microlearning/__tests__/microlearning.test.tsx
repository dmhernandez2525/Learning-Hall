import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MicroLessonList } from '../MicroLessonList';
import { SpacedRepetitionView } from '../SpacedRepetitionView';
import { MicrolearningAnalyticsDashboard } from '../MicrolearningAnalyticsDashboard';

describe('MicroLessonList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<MicroLessonList />);
    expect(screen.getByText('Loading micro lessons...')).toBeInTheDocument();
  });

  it('renders lessons after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'ml-1', title: 'Variables 101',
          durationMinutes: 5, status: 'published',
        }],
      }),
    });

    render(<MicroLessonList />);
    await waitFor(() => {
      expect(screen.getByText('Variables 101')).toBeInTheDocument();
      expect(screen.getByText('5 min')).toBeInTheDocument();
      expect(screen.getByText('published')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<MicroLessonList />);
    await waitFor(() => {
      expect(screen.getByText('No micro lessons yet.')).toBeInTheDocument();
    });
  });
});

describe('SpacedRepetitionView', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SpacedRepetitionView />);
    expect(screen.getByText('Loading due cards...')).toBeInTheDocument();
  });

  it('renders due cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'c-1', question: 'What is a closure?',
          interval: 3, easeFactor: 2.5, repetitions: 7,
        }],
      }),
    });

    render(<SpacedRepetitionView />);
    await waitFor(() => {
      expect(screen.getByText('What is a closure?')).toBeInTheDocument();
      expect(screen.getByText('Interval: 3d')).toBeInTheDocument();
      expect(screen.getByText('Reps: 7')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<SpacedRepetitionView />);
    await waitFor(() => {
      expect(screen.getByText('No cards due for review.')).toBeInTheDocument();
    });
  });
});

describe('MicrolearningAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<MicrolearningAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalMicroLessons: 47,
          publishedLessons: 39,
          totalCards: 213,
          dueCards: 18,
          totalChallenges: 56,
          challengesByDifficulty: { easy: 22, medium: 19, hard: 15 },
        },
      }),
    });

    render(<MicrolearningAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('47')).toBeInTheDocument();
      expect(screen.getByText('213')).toBeInTheDocument();
      expect(screen.getByText('Challenges by Difficulty')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<MicrolearningAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

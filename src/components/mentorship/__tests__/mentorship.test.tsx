import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MentorList } from '../MentorList';
import { SessionTracker } from '../SessionTracker';
import { MentorshipAnalyticsDashboard } from '../MentorshipAnalytics';

describe('MentorList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<MentorList />);
    expect(screen.getByText('Loading mentors...')).toBeInTheDocument();
  });

  it('renders mentor cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'mp-1',
              userId: 'user-1',
              displayName: 'Jane Doe',
              bio: 'React expert',
              expertise: ['React', 'TypeScript'],
              maxMentees: 5,
              activeMenteeCount: 2,
              availableSlots: [],
              status: 'active',
              tenantId: '',
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<MentorList />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('3 spots available')).toBeInTheDocument();
    });
  });

  it('shows empty state when no mentors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<MentorList />);

    await waitFor(() => {
      expect(screen.getByText('No mentors available.')).toBeInTheDocument();
    });
  });

  it('handles fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    render(<MentorList />);

    await waitFor(() => {
      expect(screen.getByText('No mentors available.')).toBeInTheDocument();
    });
  });
});

describe('SessionTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SessionTracker userId="user-1" />);
    expect(screen.getByText('Loading mentorship matches...')).toBeInTheDocument();
  });

  it('renders matches after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'match-1',
              mentorId: 'user-1',
              menteeId: 'user-2',
              mentorName: 'Jane',
              menteeName: 'Bob',
              courseId: 'course-1',
              status: 'active',
              matchedAt: '2026-02-01T00:00:00Z',
              completedAt: null,
              tenantId: '',
            },
          ],
        }),
    });

    render(<SessionTracker userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Bob (Mentor)')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('shows empty state when no matches', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<SessionTracker userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('No mentorship matches found.')).toBeInTheDocument();
    });
  });
});

describe('MentorshipAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<MentorshipAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            totalMatches: 10,
            activeMatches: 3,
            completedMatches: 5,
            totalSessions: 20,
            completedSessions: 15,
            averageRating: 4.2,
            cancelledSessions: 3,
            noShowSessions: 2,
          },
        }),
    });

    render(<MentorshipAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('Session Breakdown')).toBeInTheDocument();
    });
  });

  it('shows empty analytics state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<MentorshipAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CohortList } from '../CohortList';
import { CohortLeaderboard } from '../CohortLeaderboard';

describe('CohortList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CohortList courseId="course-1" />);
    expect(screen.getByText('Loading cohorts...')).toBeInTheDocument();
  });

  it('renders cohort cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [
          {
            id: 'c1',
            title: 'Spring 2026 Cohort',
            courseId: 'course-1',
            startDate: '2026-03-01T00:00:00Z',
            endDate: '2026-06-01T00:00:00Z',
            maxMembers: 30,
            memberCount: 15,
            status: 'active',
            dripSchedule: [
              { moduleId: 'm1', unlockDate: '2026-03-01T00:00:00Z' },
              { moduleId: 'm2', unlockDate: '2026-04-01T00:00:00Z' },
            ],
          },
        ],
      }),
    });

    render(<CohortList courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('Spring 2026 Cohort')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('15 / 30 members')).toBeInTheDocument();
      expect(screen.getByText('2 scheduled modules')).toBeInTheDocument();
    });
  });

  it('shows empty state when no cohorts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<CohortList courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('No cohorts available for this course.')).toBeInTheDocument();
    });
  });

  it('renders multiple cohorts with correct statuses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [
          {
            id: 'c1',
            title: 'Active Cohort',
            courseId: 'course-1',
            startDate: '2026-01-01T00:00:00Z',
            endDate: '2026-06-01T00:00:00Z',
            maxMembers: 25,
            memberCount: 20,
            status: 'active',
            dripSchedule: [],
          },
          {
            id: 'c2',
            title: 'Upcoming Cohort',
            courseId: 'course-1',
            startDate: '2026-07-01T00:00:00Z',
            endDate: '2026-12-01T00:00:00Z',
            maxMembers: 30,
            memberCount: 5,
            status: 'upcoming',
            dripSchedule: [{ moduleId: 'm1', unlockDate: '2026-07-01T00:00:00Z' }],
          },
        ],
      }),
    });

    render(<CohortList courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('Active Cohort')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Cohort')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('upcoming')).toBeInTheDocument();
    });
  });

  it('handles fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    render(<CohortList courseId="course-1" />);

    await waitFor(() => {
      expect(screen.getByText('No cohorts available for this course.')).toBeInTheDocument();
    });
  });
});

describe('CohortLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CohortLeaderboard cohortId="c1" />);
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });

  it('renders leaderboard entries with ranks', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [
          { userId: 'u1', displayName: 'Alice', completionPercent: 95, rank: 1 },
          { userId: 'u2', displayName: 'Bob', completionPercent: 80, rank: 2 },
          { userId: 'u3', displayName: 'Carol', completionPercent: 65, rank: 3 },
        ],
      }),
    });

    render(<CohortLeaderboard cohortId="c1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Carol')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });
  });

  it('shows empty state when no members', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<CohortLeaderboard cohortId="c1" />);

    await waitFor(() => {
      expect(screen.getByText('No members in this cohort yet.')).toBeInTheDocument();
    });
  });

  it('renders the leaderboard card title', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [
          { userId: 'u1', displayName: 'Test User', completionPercent: 50, rank: 1 },
        ],
      }),
    });

    render(<CohortLeaderboard cohortId="c1" />);

    await waitFor(() => {
      expect(screen.getByText('Cohort Leaderboard')).toBeInTheDocument();
    });
  });
});

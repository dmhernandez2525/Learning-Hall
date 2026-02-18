import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileList } from '../ProfileList';
import { ActivityFeedView } from '../ActivityFeedView';
import { CommunityAnalyticsDashboard } from '../CommunityAnalyticsDashboard';

describe('ProfileList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ProfileList />);
    expect(screen.getByText('Loading profiles...')).toBeInTheDocument();
  });

  it('renders profiles after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'p-1', displayName: 'Alice',
          bio: 'Engineer', interests: ['coding'],
          isPublic: true,
        }],
      }),
    });

    render(<ProfileList />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('coding')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<ProfileList />);
    await waitFor(() => {
      expect(screen.getByText('No community profiles yet.')).toBeInTheDocument();
    });
  });
});

describe('ActivityFeedView', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ActivityFeedView />);
    expect(screen.getByText('Loading activity feed...')).toBeInTheDocument();
  });

  it('renders activities after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'a-1', userName: 'Alice',
          action: 'completed', targetType: 'course',
          targetTitle: 'Intro to JS',
        }],
      }),
    });

    render(<ActivityFeedView />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Intro to JS')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<ActivityFeedView />);
    await waitFor(() => {
      expect(screen.getByText('No recent activity.')).toBeInTheDocument();
    });
  });
});

describe('CommunityAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CommunityAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalProfiles: 85, publicProfiles: 72,
          totalMessages: 340, totalActivities: 1200,
          activitiesByAction: { enrolled: 400, completed: 300, posted: 250, reviewed: 150, earned_badge: 100 },
        },
      }),
    });

    render(<CommunityAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('340')).toBeInTheDocument();
      expect(screen.getByText('Activities by Action')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<CommunityAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

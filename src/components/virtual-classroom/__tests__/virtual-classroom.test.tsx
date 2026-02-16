import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionScheduler } from '../SessionScheduler';
import { BreakoutRoomManager } from '../BreakoutRoomManager';
import { VirtualClassroomAnalyticsDashboard } from '../VirtualClassroomAnalyticsDashboard';

describe('SessionScheduler', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SessionScheduler />);
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
  });

  it('renders sessions after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'vs-1', title: 'Live Coding',
          duration: 90, participantCount: 12,
          maxParticipants: 50, status: 'scheduled',
        }],
      }),
    });

    render(<SessionScheduler />);
    await waitFor(() => {
      expect(screen.getByText('Live Coding')).toBeInTheDocument();
      expect(screen.getByText('scheduled')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<SessionScheduler />);
    await waitFor(() => {
      expect(screen.getByText('No virtual sessions scheduled.')).toBeInTheDocument();
    });
  });
});

describe('BreakoutRoomManager', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<BreakoutRoomManager sessionId="vs-1" />);
    expect(screen.getByText('Loading breakout rooms...')).toBeInTheDocument();
  });

  it('renders rooms after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'br-1', name: 'Team Alpha',
          capacity: 8, participantCount: 3, status: 'open',
        }],
      }),
    });

    render(<BreakoutRoomManager sessionId="vs-1" />);
    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('open')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<BreakoutRoomManager sessionId="vs-1" />);
    await waitFor(() => {
      expect(screen.getByText('No breakout rooms created.')).toBeInTheDocument();
    });
  });
});

describe('VirtualClassroomAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<VirtualClassroomAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalSessions: 25, liveSessions: 2,
          completedSessions: 18, totalParticipants: 340,
          avgParticipants: 14,
          sessionsByStatus: { scheduled: 5, live: 2, completed: 18 },
        },
      }),
    });

    render(<VirtualClassroomAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('340')).toBeInTheDocument();
      expect(screen.getByText('Sessions by Status')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<VirtualClassroomAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

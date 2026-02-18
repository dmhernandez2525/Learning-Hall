import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TeamProgressView } from '../TeamProgressView';
import { AssignmentManager } from '../AssignmentManager';
import { ManagerDashboardView } from '../ManagerDashboardView';

describe('TeamProgressView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<TeamProgressView />);
    expect(screen.getByText('Loading team progress...')).toBeInTheDocument();
  });

  it('renders team table after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              userId: 'user-1',
              userName: 'Alice',
              userEmail: 'alice@test.com',
              enrolledCourses: 5,
              completedCourses: 3,
              averageProgress: 60,
              overdueAssignments: 1,
              lastActivity: '2026-02-10T00:00:00Z',
            },
          ],
        }),
    });

    render(<TeamProgressView />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  it('shows empty state when no members', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<TeamProgressView />);

    await waitFor(() => {
      expect(screen.getByText('No team members found.')).toBeInTheDocument();
    });
  });
});

describe('AssignmentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AssignmentManager />);
    expect(screen.getByText('Loading assignments...')).toBeInTheDocument();
  });

  it('renders assignment cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'ta-1',
              managerId: 'mgr-1',
              userId: 'user-1',
              userName: 'Alice',
              courseId: 'course-1',
              courseName: 'Security Training',
              dueDate: '2026-06-01T00:00:00Z',
              status: 'in_progress',
              progressPercent: 45,
              assignedAt: '2026-02-01T00:00:00Z',
              completedAt: null,
            },
          ],
        }),
    });

    render(<AssignmentManager />);

    await waitFor(() => {
      expect(screen.getByText('Security Training')).toBeInTheDocument();
      expect(screen.getByText('in_progress')).toBeInTheDocument();
    });
  });

  it('shows empty state when no assignments', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<AssignmentManager />);

    await waitFor(() => {
      expect(screen.getByText('No training assignments.')).toBeInTheDocument();
    });
  });
});

describe('ManagerDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ManagerDashboardView />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            teamSize: 8,
            totalAssignments: 24,
            completedAssignments: 16,
            overdueAssignments: 3,
            completionRate: 67,
            teamMembers: [],
          },
        }),
    });

    render(<ManagerDashboardView />);

    await waitFor(() => {
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<ManagerDashboardView />);

    await waitFor(() => {
      expect(screen.getByText('No dashboard data.')).toBeInTheDocument();
    });
  });
});

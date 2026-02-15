import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RequirementList } from '../RequirementList';
import { AssignmentTracker } from '../AssignmentTracker';
import { ComplianceReportDashboard } from '../ComplianceReportDashboard';

describe('RequirementList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<RequirementList />);
    expect(screen.getByText('Loading requirements...')).toBeInTheDocument();
  });

  it('renders requirement cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'req-1',
              title: 'Security Training',
              description: 'Annual training',
              courseId: 'course-1',
              organizationId: 'org-1',
              dueDate: '2026-12-01T00:00:00Z',
              isRequired: true,
              status: 'active',
              assigneeCount: 50,
              completionCount: 30,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<RequirementList />);

    await waitFor(() => {
      expect(screen.getByText('Security Training')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('30/50')).toBeInTheDocument();
    });
  });

  it('shows empty state when no requirements', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<RequirementList />);

    await waitFor(() => {
      expect(screen.getByText('No compliance requirements found.')).toBeInTheDocument();
    });
  });
});

describe('AssignmentTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AssignmentTracker />);
    expect(screen.getByText('Loading assignments...')).toBeInTheDocument();
  });

  it('renders assignment cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'assign-1',
              requirementId: 'req-1',
              userId: 'user-1',
              userName: 'Alice',
              userEmail: 'alice@test.com',
              status: 'pending',
              dueDate: '2026-06-01T00:00:00Z',
              completedAt: null,
              courseProgressPercent: 40,
            },
          ],
        }),
    });

    render(<AssignmentTracker />);

    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  it('shows empty state when no assignments', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<AssignmentTracker />);

    await waitFor(() => {
      expect(screen.getByText('No compliance assignments.')).toBeInTheDocument();
    });
  });
});

describe('ComplianceReportDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ComplianceReportDashboard />);
    expect(screen.getByText('Loading report...')).toBeInTheDocument();
  });

  it('renders report after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            totalAssignments: 100,
            completedCount: 60,
            overdueCount: 15,
            pendingCount: 25,
            completionRate: 60,
            overdueRate: 15,
          },
        }),
    });

    render(<ComplianceReportDashboard />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Completion Progress')).toBeInTheDocument();
    });
  });

  it('shows empty report state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<ComplianceReportDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No report available.')).toBeInTheDocument();
    });
  });
});

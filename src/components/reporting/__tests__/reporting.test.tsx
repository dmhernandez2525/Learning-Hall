import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReportBuilder } from '../ReportBuilder';
import { ExecutionHistory } from '../ExecutionHistory';
import { ReportingAnalyticsDashboard } from '../ReportingAnalyticsDashboard';

describe('ReportBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ReportBuilder />);
    expect(screen.getByText('Loading reports...')).toBeInTheDocument();
  });

  it('renders report cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'rpt-1',
              name: 'Monthly Enrollment',
              description: 'Track enrollments',
              reportType: 'enrollment',
              status: 'active',
              columns: [{ key: 'id', label: 'ID', dataType: 'string', sortable: true }],
              filters: [],
              schedule: { frequency: 'monthly' },
              lastRunAt: '2026-02-01T08:00:00Z',
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<ReportBuilder />);

    await waitFor(() => {
      expect(screen.getByText('Monthly Enrollment')).toBeInTheDocument();
      expect(screen.getByText('Enrollment')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  it('shows empty state when no reports', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<ReportBuilder />);

    await waitFor(() => {
      expect(screen.getByText('No reports configured.')).toBeInTheDocument();
    });
  });
});

describe('ExecutionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ExecutionHistory />);
    expect(screen.getByText('Loading executions...')).toBeInTheDocument();
  });

  it('renders execution table after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'exec-1',
              reportId: 'rpt-1',
              reportName: 'Monthly Enrollment',
              executedBy: 'user-1',
              status: 'completed',
              exportFormat: 'csv',
              rowCount: 150,
              fileUrl: null,
              errorMessage: null,
              startedAt: '2026-02-01T08:00:00Z',
              completedAt: '2026-02-01T08:01:00Z',
            },
          ],
        }),
    });

    render(<ExecutionHistory />);

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Monthly Enrollment')).toBeInTheDocument();
    });
  });

  it('shows empty state when no executions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<ExecutionHistory />);

    await waitFor(() => {
      expect(screen.getByText('No executions yet.')).toBeInTheDocument();
    });
  });
});

describe('ReportingAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ReportingAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          doc: {
            totalReports: 12,
            activeReports: 9,
            scheduledReports: 5,
            totalExecutions: 45,
            executionsByType: {
              enrollment: 15,
              compliance: 10,
              completion: 7,
            },
          },
        }),
    });

    render(<ReportingAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Reports by Type')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    render(<ReportingAnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

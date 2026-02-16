import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuditLogViewer } from '../AuditLogViewer';
import { AuditAnalyticsDashboard } from '../AuditAnalyticsDashboard';

describe('AuditLogViewer', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AuditLogViewer />);
    expect(screen.getByText('Loading audit logs...')).toBeInTheDocument();
  });

  it('renders log entries after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'log-1', userId: 'user-1', userName: 'Alice',
          action: 'create', resource: 'courses', resourceId: 'course-1',
          ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0',
          timestamp: '2026-02-01T12:00:00Z',
        }],
      }),
    });

    render(<AuditLogViewer />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('create')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<AuditLogViewer />);
    await waitFor(() => {
      expect(screen.getByText('No audit log entries.')).toBeInTheDocument();
    });
  });
});

describe('AuditAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<AuditAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalEntries: 500, entriesLast24h: 25, entriesLast7d: 150,
          topActions: { create: 80, update: 50, delete: 20 },
          topResources: { courses: 60, users: 40 },
        },
      }),
    });

    render(<AuditAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Top Actions (7 days)')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<AuditAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

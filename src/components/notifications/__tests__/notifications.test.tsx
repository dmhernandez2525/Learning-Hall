import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationInbox } from '../NotificationInbox';
import { DigestSettings } from '../DigestSettings';
import { NotificationAnalyticsDashboard } from '../NotificationAnalyticsDashboard';

describe('NotificationInbox', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<NotificationInbox />);
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('renders notifications after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'n-1', type: 'success', title: 'Badge Earned',
          message: 'You earned the Explorer badge', isRead: false,
        }],
      }),
    });

    render(<NotificationInbox />);
    await waitFor(() => {
      expect(screen.getByText('Badge Earned')).toBeInTheDocument();
      expect(screen.getByText('You earned the Explorer badge')).toBeInTheDocument();
      expect(screen.getByText('Unread')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<NotificationInbox />);
    await waitFor(() => {
      expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
    });
  });
});

describe('DigestSettings', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<DigestSettings />);
    expect(screen.getByText('Loading digest settings...')).toBeInTheDocument();
  });

  it('renders digest config after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          id: 'dc-1', frequency: 'weekly', isEnabled: true,
          lastSentAt: '2026-02-14T08:00:00Z',
        },
      }),
    });

    render(<DigestSettings />);
    await waitFor(() => {
      expect(screen.getByText('weekly')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });
  });

  it('shows empty state when no config', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ doc: null }),
    });
    render(<DigestSettings />);
    await waitFor(() => {
      expect(screen.getByText('No digest configuration found.')).toBeInTheDocument();
    });
  });
});

describe('NotificationAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<NotificationAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalNotifications: 187,
          unreadCount: 23,
          readRate: 88,
          notificationsByType: { info: 92, success: 48, warning: 31, alert: 16 },
        },
      }),
    });

    render(<NotificationAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('187')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();
      expect(screen.getByText('Notifications by Type')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<NotificationAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

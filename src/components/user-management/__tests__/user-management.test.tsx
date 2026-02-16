import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GroupManager } from '../GroupManager';
import { CustomFieldList } from '../CustomFieldList';
import { UserManagementAnalyticsDashboard } from '../UserManagementAnalyticsDashboard';

describe('GroupManager', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<GroupManager />);
    expect(screen.getByText('Loading groups...')).toBeInTheDocument();
  });

  it('renders groups after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'g-1', name: 'Engineering',
          description: 'Dev team', memberCount: 12,
        }],
      }),
    });

    render(<GroupManager />);
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('12 members')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<GroupManager />);
    await waitFor(() => {
      expect(screen.getByText('No groups found.')).toBeInTheDocument();
    });
  });
});

describe('CustomFieldList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<CustomFieldList />);
    expect(screen.getByText('Loading custom fields...')).toBeInTheDocument();
  });

  it('renders fields after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        docs: [{
          id: 'cf-1', fieldName: 'Department',
          fieldType: 'select', isRequired: true,
        }],
      }),
    });

    render(<CustomFieldList />);
    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('select')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ docs: [] }),
    });
    render(<CustomFieldList />);
    await waitFor(() => {
      expect(screen.getByText('No custom fields defined.')).toBeInTheDocument();
    });
  });
});

describe('UserManagementAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<UserManagementAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        doc: {
          totalUsers: 150, totalGroups: 6,
          totalCustomFields: 4, recentSignups: 11,
          usersByRole: { admin: 3, instructor: 12, student: 135 },
        },
      }),
    });

    render(<UserManagementAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
    });
  });

  it('shows empty state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'err' }),
    });
    render(<UserManagementAnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No analytics available.')).toBeInTheDocument();
    });
  });
});

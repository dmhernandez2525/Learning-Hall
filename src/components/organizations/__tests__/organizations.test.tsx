import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OrgList } from '../OrgList';
import { MemberTable } from '../MemberTable';
import { DepartmentTree } from '../DepartmentTree';

describe('OrgList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<OrgList />);
    expect(screen.getByText('Loading organizations...')).toBeInTheDocument();
  });

  it('renders org cards after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'org-1',
              name: 'Acme Corp',
              slug: 'acme-corp',
              parentId: null,
              tenantId: 'tenant-1',
              description: 'A great company',
              logoUrl: '',
              status: 'active',
              memberCount: 50,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<OrgList />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('50 members')).toBeInTheDocument();
    });
  });

  it('shows empty state when no orgs', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<OrgList />);

    await waitFor(() => {
      expect(screen.getByText('No organizations found.')).toBeInTheDocument();
    });
  });
});

describe('MemberTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<MemberTable organizationId="org-1" />);
    expect(screen.getByText('Loading members...')).toBeInTheDocument();
  });

  it('renders member rows after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'mem-1',
              userId: 'user-1',
              userName: 'Alice',
              userEmail: 'alice@test.com',
              organizationId: 'org-1',
              departmentId: null,
              role: 'admin',
              joinedAt: '2026-02-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<MemberTable organizationId="org-1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('alice@test.com')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('shows empty state when no members', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<MemberTable organizationId="org-1" />);

    await waitFor(() => {
      expect(screen.getByText('No members yet.')).toBeInTheDocument();
    });
  });
});

describe('DepartmentTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<DepartmentTree organizationId="org-1" />);
    expect(screen.getByText('Loading departments...')).toBeInTheDocument();
  });

  it('renders department tree after fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          docs: [
            {
              id: 'dept-1',
              name: 'Engineering',
              organizationId: 'org-1',
              parentDepartmentId: null,
              managerId: 'user-1',
              managerName: 'Alice',
              memberCount: 20,
              createdAt: '2026-01-01T00:00:00Z',
            },
            {
              id: 'dept-2',
              name: 'Frontend',
              organizationId: 'org-1',
              parentDepartmentId: 'dept-1',
              managerId: null,
              managerName: '',
              memberCount: 8,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
        }),
    });

    render(<DepartmentTree organizationId="org-1" />);

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
    });
  });

  it('shows empty state when no departments', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ docs: [] }),
    });

    render(<DepartmentTree organizationId="org-1" />);

    await waitFor(() => {
      expect(screen.getByText('No departments created yet.')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  formatOrganization,
  formatDepartment,
  formatMembership,
} from '../organizations';

describe('formatOrganization', () => {
  it('maps a full organization document', () => {
    const doc: Record<string, unknown> = {
      id: 'org-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      parent: null,
      tenant: 'tenant-1',
      description: 'A great company',
      logoUrl: 'https://example.com/logo.png',
      status: 'active',
      memberCount: 50,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatOrganization(doc);
    expect(result.id).toBe('org-1');
    expect(result.name).toBe('Acme Corp');
    expect(result.slug).toBe('acme-corp');
    expect(result.parentId).toBeNull();
    expect(result.tenantId).toBe('tenant-1');
    expect(result.memberCount).toBe(50);
    expect(result.status).toBe('active');
  });

  it('handles object tenant and parent references', () => {
    const doc: Record<string, unknown> = {
      id: 'org-2',
      name: 'Sub Org',
      slug: 'sub-org',
      parent: { id: 'org-1' },
      tenant: { id: 'tenant-2' },
      status: 'active',
      memberCount: 10,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatOrganization(doc);
    expect(result.parentId).toBe('org-1');
    expect(result.tenantId).toBe('tenant-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'org-3', tenant: 't-1' };
    const result = formatOrganization(doc);
    expect(result.name).toBe('');
    expect(result.slug).toBe('');
    expect(result.description).toBe('');
    expect(result.memberCount).toBe(0);
  });
});

describe('formatDepartment', () => {
  it('maps a department document', () => {
    const doc: Record<string, unknown> = {
      id: 'dept-1',
      name: 'Engineering',
      organization: 'org-1',
      parentDepartment: null,
      manager: { id: 'user-1', name: 'Alice' },
      memberCount: 20,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatDepartment(doc);
    expect(result.id).toBe('dept-1');
    expect(result.name).toBe('Engineering');
    expect(result.organizationId).toBe('org-1');
    expect(result.parentDepartmentId).toBeNull();
    expect(result.managerId).toBe('user-1');
    expect(result.managerName).toBe('Alice');
    expect(result.memberCount).toBe(20);
  });

  it('handles nested parent department', () => {
    const doc: Record<string, unknown> = {
      id: 'dept-2',
      name: 'Frontend',
      organization: { id: 'org-1' },
      parentDepartment: { id: 'dept-1' },
      manager: 'user-2',
      memberCount: 8,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatDepartment(doc);
    expect(result.organizationId).toBe('org-1');
    expect(result.parentDepartmentId).toBe('dept-1');
    expect(result.managerId).toBe('user-2');
    expect(result.managerName).toBe('');
  });
});

describe('formatMembership', () => {
  it('maps a membership document with populated user', () => {
    const doc: Record<string, unknown> = {
      id: 'mem-1',
      user: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
      organization: 'org-1',
      department: 'dept-1',
      role: 'admin',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatMembership(doc);
    expect(result.userId).toBe('user-1');
    expect(result.userName).toBe('Alice');
    expect(result.userEmail).toBe('alice@test.com');
    expect(result.organizationId).toBe('org-1');
    expect(result.departmentId).toBe('dept-1');
    expect(result.role).toBe('admin');
  });

  it('handles string user reference', () => {
    const doc: Record<string, unknown> = {
      id: 'mem-2',
      user: 'user-3',
      organization: { id: 'org-2' },
      role: 'member',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatMembership(doc);
    expect(result.userId).toBe('user-3');
    expect(result.userName).toBe('');
    expect(result.departmentId).toBeNull();
  });
});

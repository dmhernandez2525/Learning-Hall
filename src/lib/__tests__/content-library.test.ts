import { describe, it, expect } from 'vitest';
import { formatItem, formatVersion, formatApproval } from '../content-library';

describe('formatItem', () => {
  it('maps a full content item document', () => {
    const doc: Record<string, unknown> = {
      id: 'ci-1',
      title: 'Security Policy',
      description: 'Company security policy document',
      contentType: 'document',
      organization: 'org-1',
      createdBy: 'user-1',
      currentVersion: 'ver-1',
      versionCount: 3,
      tags: ['security', 'policy'],
      status: 'approved',
      approvedBy: 'admin-1',
      approvedAt: '2026-02-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatItem(doc);
    expect(result.id).toBe('ci-1');
    expect(result.title).toBe('Security Policy');
    expect(result.contentType).toBe('document');
    expect(result.versionCount).toBe(3);
    expect(result.tags).toEqual(['security', 'policy']);
    expect(result.status).toBe('approved');
    expect(result.approvedBy).toBe('admin-1');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'ci-2',
      title: 'Training Video',
      organization: { id: 'org-2' },
      createdBy: { id: 'user-2' },
      currentVersion: { id: 'ver-2' },
      contentType: 'video',
      status: 'draft',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatItem(doc);
    expect(result.organizationId).toBe('org-2');
    expect(result.createdBy).toBe('user-2');
    expect(result.currentVersionId).toBe('ver-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ci-3' };
    const result = formatItem(doc);
    expect(result.title).toBe('');
    expect(result.contentType).toBe('document');
    expect(result.status).toBe('draft');
    expect(result.versionCount).toBe(0);
    expect(result.tags).toEqual([]);
    expect(result.currentVersionId).toBeNull();
    expect(result.approvedBy).toBeNull();
    expect(result.approvedAt).toBeNull();
  });
});

describe('formatVersion', () => {
  it('maps a full version document', () => {
    const doc: Record<string, unknown> = {
      id: 'ver-1',
      contentItem: 'ci-1',
      versionNumber: 3,
      changelog: 'Updated section 5',
      fileUrl: '/files/policy-v3.pdf',
      fileSize: 512000,
      createdBy: 'user-1',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatVersion(doc);
    expect(result.id).toBe('ver-1');
    expect(result.contentItemId).toBe('ci-1');
    expect(result.versionNumber).toBe(3);
    expect(result.changelog).toBe('Updated section 5');
    expect(result.fileSize).toBe(512000);
  });
});

describe('formatApproval', () => {
  it('maps a full approval document', () => {
    const doc: Record<string, unknown> = {
      id: 'apr-1',
      contentItem: 'ci-1',
      reviewer: { id: 'admin-1', name: 'Admin Alice' },
      decision: 'approved',
      comments: 'Looks good',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatApproval(doc);
    expect(result.id).toBe('apr-1');
    expect(result.contentItemId).toBe('ci-1');
    expect(result.reviewerId).toBe('admin-1');
    expect(result.reviewerName).toBe('Admin Alice');
    expect(result.decision).toBe('approved');
    expect(result.comments).toBe('Looks good');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'apr-2' };
    const result = formatApproval(doc);
    expect(result.decision).toBe('needs_changes');
    expect(result.comments).toBe('');
  });
});

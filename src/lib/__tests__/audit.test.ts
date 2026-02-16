import { describe, it, expect } from 'vitest';
import { formatLogEntry, formatRetentionPolicy } from '../audit';

describe('formatLogEntry', () => {
  it('maps a full audit log entry', () => {
    const doc: Record<string, unknown> = {
      id: 'log-1',
      user: { id: 'user-1', name: 'Alice' },
      action: 'create',
      resource: 'courses',
      resourceId: 'course-1',
      details: { title: 'New Course' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      timestamp: '2026-02-01T12:00:00Z',
    };

    const result = formatLogEntry(doc);
    expect(result.id).toBe('log-1');
    expect(result.userId).toBe('user-1');
    expect(result.userName).toBe('Alice');
    expect(result.action).toBe('create');
    expect(result.resource).toBe('courses');
    expect(result.resourceId).toBe('course-1');
    expect(result.ipAddress).toBe('192.168.1.1');
  });

  it('handles string user reference', () => {
    const doc: Record<string, unknown> = {
      id: 'log-2',
      user: 'user-2',
      action: 'delete',
      resource: 'users',
      resourceId: 'user-3',
      timestamp: '2026-02-01T12:00:00Z',
    };
    const result = formatLogEntry(doc);
    expect(result.userId).toBe('user-2');
    expect(result.userName).toBe('');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'log-3' };
    const result = formatLogEntry(doc);
    expect(result.action).toBe('');
    expect(result.ipAddress).toBe('');
    expect(result.details).toEqual({});
  });
});

describe('formatRetentionPolicy', () => {
  it('maps a full retention policy', () => {
    const doc: Record<string, unknown> = {
      id: 'ret-1',
      organization: 'org-1',
      retentionDays: 730,
      autoExport: true,
      exportFormat: 'json',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatRetentionPolicy(doc);
    expect(result.id).toBe('ret-1');
    expect(result.retentionDays).toBe(730);
    expect(result.autoExport).toBe(true);
    expect(result.exportFormat).toBe('json');
    expect(result.isActive).toBe(true);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ret-2' };
    const result = formatRetentionPolicy(doc);
    expect(result.retentionDays).toBe(365);
    expect(result.autoExport).toBe(false);
    expect(result.exportFormat).toBe('csv');
  });
});

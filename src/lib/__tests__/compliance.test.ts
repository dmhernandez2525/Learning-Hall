import { describe, it, expect } from 'vitest';
import { formatRequirement, formatAssignment } from '../compliance';

describe('formatRequirement', () => {
  it('maps a full requirement document', () => {
    const doc: Record<string, unknown> = {
      id: 'req-1',
      title: 'Security Training',
      description: 'Annual security awareness',
      course: 'course-1',
      organization: 'org-1',
      dueDate: '2026-06-01T00:00:00Z',
      isRequired: true,
      status: 'active',
      assigneeCount: 50,
      completionCount: 30,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatRequirement(doc);
    expect(result.id).toBe('req-1');
    expect(result.title).toBe('Security Training');
    expect(result.courseId).toBe('course-1');
    expect(result.organizationId).toBe('org-1');
    expect(result.isRequired).toBe(true);
    expect(result.assigneeCount).toBe(50);
    expect(result.completionCount).toBe(30);
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'req-2',
      title: 'HIPAA Compliance',
      course: { id: 'course-2' },
      organization: { id: 'org-2' },
      dueDate: '2026-07-01T00:00:00Z',
      status: 'draft',
      assigneeCount: 0,
      completionCount: 0,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatRequirement(doc);
    expect(result.courseId).toBe('course-2');
    expect(result.organizationId).toBe('org-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'req-3' };
    const result = formatRequirement(doc);
    expect(result.title).toBe('');
    expect(result.description).toBe('');
    expect(result.isRequired).toBe(true);
    expect(result.status).toBe('draft');
    expect(result.assigneeCount).toBe(0);
    expect(result.completionCount).toBe(0);
  });
});

describe('formatAssignment', () => {
  it('maps a full assignment document', () => {
    const doc: Record<string, unknown> = {
      id: 'assign-1',
      requirement: 'req-1',
      user: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
      status: 'completed',
      dueDate: '2026-06-01T00:00:00Z',
      completedAt: '2026-05-15T00:00:00Z',
      courseProgressPercent: 100,
    };

    const result = formatAssignment(doc);
    expect(result.id).toBe('assign-1');
    expect(result.requirementId).toBe('req-1');
    expect(result.userId).toBe('user-1');
    expect(result.userName).toBe('Alice');
    expect(result.userEmail).toBe('alice@test.com');
    expect(result.status).toBe('completed');
    expect(result.completedAt).toBe('2026-05-15T00:00:00Z');
    expect(result.courseProgressPercent).toBe(100);
  });

  it('handles object requirement reference', () => {
    const doc: Record<string, unknown> = {
      id: 'assign-2',
      requirement: { id: 'req-2' },
      user: 'user-2',
      status: 'pending',
      dueDate: '2026-07-01T00:00:00Z',
      completedAt: null,
      courseProgressPercent: 0,
    };

    const result = formatAssignment(doc);
    expect(result.requirementId).toBe('req-2');
    expect(result.userId).toBe('user-2');
    expect(result.userName).toBe('');
    expect(result.completedAt).toBeNull();
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'assign-3' };
    const result = formatAssignment(doc);
    expect(result.status).toBe('pending');
    expect(result.courseProgressPercent).toBe(0);
    expect(result.completedAt).toBeNull();
  });
});

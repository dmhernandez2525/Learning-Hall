import { describe, it, expect } from 'vitest';
import { formatAssignment } from '../manager';

describe('formatAssignment', () => {
  it('maps a full training assignment document', () => {
    const doc: Record<string, unknown> = {
      id: 'ta-1',
      manager: { id: 'mgr-1' },
      user: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
      course: { id: 'course-1', title: 'Security Training' },
      dueDate: '2026-06-01T00:00:00Z',
      status: 'in_progress',
      progressPercent: 45,
      createdAt: '2026-02-01T00:00:00Z',
      completedAt: null,
    };

    const result = formatAssignment(doc);
    expect(result.id).toBe('ta-1');
    expect(result.managerId).toBe('mgr-1');
    expect(result.userId).toBe('user-1');
    expect(result.userName).toBe('Alice');
    expect(result.userEmail).toBe('alice@test.com');
    expect(result.courseId).toBe('course-1');
    expect(result.courseName).toBe('Security Training');
    expect(result.status).toBe('in_progress');
    expect(result.progressPercent).toBe(45);
    expect(result.completedAt).toBeNull();
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'ta-2',
      manager: 'mgr-2',
      user: 'user-2',
      course: 'course-2',
      dueDate: '2026-07-01T00:00:00Z',
      status: 'completed',
      progressPercent: 100,
      createdAt: '2026-02-01T00:00:00Z',
      completedAt: '2026-05-15T00:00:00Z',
    };

    const result = formatAssignment(doc);
    expect(result.managerId).toBe('mgr-2');
    expect(result.userId).toBe('user-2');
    expect(result.userName).toBe('');
    expect(result.courseId).toBe('course-2');
    expect(result.courseName).toBe('');
    expect(result.completedAt).toBe('2026-05-15T00:00:00Z');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ta-3' };
    const result = formatAssignment(doc);
    expect(result.status).toBe('assigned');
    expect(result.progressPercent).toBe(0);
    expect(result.completedAt).toBeNull();
  });
});

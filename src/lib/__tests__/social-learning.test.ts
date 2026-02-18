import { describe, it, expect } from 'vitest';
import { formatGroup, formatNote, formatSession } from '../social-learning';

describe('formatGroup', () => {
  it('maps a full study group document', () => {
    const doc: Record<string, unknown> = {
      id: 'sg-1',
      name: 'JS Study Group',
      description: 'Learn JavaScript together',
      course: 'course-1',
      maxMembers: 20,
      memberCount: 8,
      isPublic: true,
      createdBy: 'user-1',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatGroup(doc);
    expect(result.id).toBe('sg-1');
    expect(result.name).toBe('JS Study Group');
    expect(result.maxMembers).toBe(20);
    expect(result.memberCount).toBe(8);
    expect(result.isPublic).toBe(true);
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'sg-2',
      course: { id: 'c-2', title: 'React' },
      createdBy: { id: 'u-2', name: 'Alice' },
      createdAt: '',
    };
    const result = formatGroup(doc);
    expect(result.courseId).toBe('c-2');
    expect(result.createdBy).toBe('u-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'sg-3' };
    const result = formatGroup(doc);
    expect(result.name).toBe('');
    expect(result.maxMembers).toBe(20);
    expect(result.memberCount).toBe(0);
    expect(result.isPublic).toBe(false);
  });
});

describe('formatNote', () => {
  it('maps a full collaborative note with object refs', () => {
    const doc: Record<string, unknown> = {
      id: 'n-1',
      group: { id: 'sg-1' },
      title: 'Chapter 1 Summary',
      content: 'Key points from chapter 1...',
      author: { id: 'u-1', name: 'Alice' },
      lastEditedAt: '2026-02-10T00:00:00Z',
    };

    const result = formatNote(doc);
    expect(result.id).toBe('n-1');
    expect(result.title).toBe('Chapter 1 Summary');
    expect(result.authorName).toBe('Alice');
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'n-2', group: 'sg-2', author: 'u-2',
      title: 'Note', content: 'Content',
    };
    const result = formatNote(doc);
    expect(result.groupId).toBe('sg-2');
    expect(result.authorId).toBe('u-2');
    expect(result.authorName).toBe('');
  });
});

describe('formatSession', () => {
  it('maps a full peer teaching session', () => {
    const doc: Record<string, unknown> = {
      id: 'ps-1',
      group: 'sg-1',
      teacher: { id: 'u-1', name: 'Bob' },
      topic: 'Closures in JavaScript',
      scheduledAt: '2026-02-20T14:00:00Z',
      duration: 45,
      status: 'scheduled',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatSession(doc);
    expect(result.teacherName).toBe('Bob');
    expect(result.topic).toBe('Closures in JavaScript');
    expect(result.duration).toBe(45);
    expect(result.status).toBe('scheduled');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ps-2' };
    const result = formatSession(doc);
    expect(result.topic).toBe('');
    expect(result.duration).toBe(30);
    expect(result.status).toBe('scheduled');
  });
});

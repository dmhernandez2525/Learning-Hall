import { describe, it, expect } from 'vitest';
import {
  formatMentorProfile,
  formatMatch,
  formatSession,
} from '../mentorship';

describe('formatMentorProfile', () => {
  it('maps a full document to MentorProfile', () => {
    const doc: Record<string, unknown> = {
      id: 'mp-1',
      user: 'user-1',
      displayName: 'Jane Doe',
      bio: 'Expert in React',
      expertise: ['React', 'TypeScript'],
      maxMentees: 5,
      activeMenteeCount: 2,
      availableSlots: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }],
      status: 'active',
      tenant: 'tenant-1',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatMentorProfile(doc);

    expect(result.id).toBe('mp-1');
    expect(result.userId).toBe('user-1');
    expect(result.displayName).toBe('Jane Doe');
    expect(result.expertise).toEqual(['React', 'TypeScript']);
    expect(result.maxMentees).toBe(5);
    expect(result.activeMenteeCount).toBe(2);
    expect(result.availableSlots).toHaveLength(1);
    expect(result.status).toBe('active');
    expect(result.tenantId).toBe('tenant-1');
  });

  it('handles object relationships for user', () => {
    const doc: Record<string, unknown> = {
      id: 'mp-2',
      user: { id: 'user-2', name: 'John' },
      displayName: 'John Smith',
      bio: 'Mentor',
      expertise: [],
      maxMentees: 3,
      activeMenteeCount: 0,
      availableSlots: [],
      status: 'paused',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatMentorProfile(doc);
    expect(result.userId).toBe('user-2');
    expect(result.tenantId).toBe('');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'mp-3' };
    const result = formatMentorProfile(doc);
    expect(result.displayName).toBe('');
    expect(result.bio).toBe('');
    expect(result.expertise).toEqual([]);
    expect(result.maxMentees).toBe(5);
    expect(result.activeMenteeCount).toBe(0);
    expect(result.availableSlots).toEqual([]);
  });
});

describe('formatMatch', () => {
  it('maps a match document with string refs', () => {
    const doc: Record<string, unknown> = {
      id: 'match-1',
      mentor: 'user-1',
      mentee: 'user-2',
      course: 'course-1',
      status: 'active',
      matchedAt: '2026-02-01T00:00:00Z',
      completedAt: null,
      tenant: 'tenant-1',
    };

    const result = formatMatch(doc);
    expect(result.id).toBe('match-1');
    expect(result.mentorId).toBe('user-1');
    expect(result.menteeId).toBe('user-2');
    expect(result.courseId).toBe('course-1');
    expect(result.status).toBe('active');
    expect(result.completedAt).toBeNull();
  });

  it('maps a match with populated object refs', () => {
    const doc: Record<string, unknown> = {
      id: 'match-2',
      mentor: { id: 'user-3', name: 'Alice', email: 'alice@test.com' },
      mentee: { id: 'user-4', name: 'Bob' },
      course: { id: 'course-2' },
      status: 'completed',
      matchedAt: '2026-02-01T00:00:00Z',
      completedAt: '2026-03-01T00:00:00Z',
    };

    const result = formatMatch(doc);
    expect(result.mentorId).toBe('user-3');
    expect(result.mentorName).toBe('Alice');
    expect(result.menteeId).toBe('user-4');
    expect(result.menteeName).toBe('Bob');
    expect(result.completedAt).toBe('2026-03-01T00:00:00Z');
  });

  it('falls back to email if name is missing', () => {
    const doc: Record<string, unknown> = {
      id: 'match-3',
      mentor: { id: 'user-5', email: 'mentor@test.com' },
      mentee: { id: 'user-6', email: 'mentee@test.com' },
      course: 'course-1',
      status: 'pending',
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatMatch(doc);
    expect(result.mentorName).toBe('mentor@test.com');
    expect(result.menteeName).toBe('mentee@test.com');
  });
});

describe('formatSession', () => {
  it('maps a session document', () => {
    const doc: Record<string, unknown> = {
      id: 'session-1',
      match: 'match-1',
      mentor: 'user-1',
      mentee: 'user-2',
      scheduledAt: '2026-02-15T10:00:00Z',
      durationMinutes: 45,
      status: 'scheduled',
      notes: 'Discuss React hooks',
      menteeRating: null,
      menteeFeedback: '',
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatSession(doc);
    expect(result.id).toBe('session-1');
    expect(result.matchId).toBe('match-1');
    expect(result.durationMinutes).toBe(45);
    expect(result.status).toBe('scheduled');
    expect(result.menteeRating).toBeNull();
  });

  it('maps populated refs and rating', () => {
    const doc: Record<string, unknown> = {
      id: 'session-2',
      match: { id: 'match-2' },
      mentor: { id: 'user-3' },
      mentee: { id: 'user-4' },
      scheduledAt: '2026-02-15T14:00:00Z',
      durationMinutes: 60,
      status: 'completed',
      notes: 'Great session',
      menteeRating: 5,
      menteeFeedback: 'Very helpful',
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatSession(doc);
    expect(result.matchId).toBe('match-2');
    expect(result.mentorId).toBe('user-3');
    expect(result.menteeRating).toBe(5);
    expect(result.menteeFeedback).toBe('Very helpful');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'session-3' };
    const result = formatSession(doc);
    expect(result.durationMinutes).toBe(30);
    expect(result.notes).toBe('');
    expect(result.menteeRating).toBeNull();
    expect(result.status).toBe('scheduled');
  });
});

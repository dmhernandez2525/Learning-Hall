import { describe, it, expect } from 'vitest';
import { formatSession, formatParticipant, formatBreakoutRoom } from '../virtual-classroom';

describe('formatSession', () => {
  it('maps a full session document', () => {
    const doc: Record<string, unknown> = {
      id: 'vs-1',
      course: 'course-1',
      title: 'Live Coding Session',
      description: 'Build a REST API',
      host: { id: 'user-1', name: 'Prof. Smith' },
      scheduledAt: '2026-02-20T14:00:00Z',
      duration: 90,
      status: 'scheduled',
      maxParticipants: 50,
      participantCount: 12,
      recordingUrl: '',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatSession(doc);
    expect(result.id).toBe('vs-1');
    expect(result.title).toBe('Live Coding Session');
    expect(result.hostId).toBe('user-1');
    expect(result.hostName).toBe('Prof. Smith');
    expect(result.duration).toBe(90);
    expect(result.status).toBe('scheduled');
    expect(result.maxParticipants).toBe(50);
  });

  it('handles string host reference', () => {
    const doc: Record<string, unknown> = {
      id: 'vs-2', host: 'user-2', createdAt: '2026-02-01T00:00:00Z',
    };
    const result = formatSession(doc);
    expect(result.hostId).toBe('user-2');
    expect(result.hostName).toBe('');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'vs-3' };
    const result = formatSession(doc);
    expect(result.title).toBe('');
    expect(result.duration).toBe(60);
    expect(result.maxParticipants).toBe(100);
    expect(result.participantCount).toBe(0);
  });
});

describe('formatParticipant', () => {
  it('maps a full participant with object refs', () => {
    const doc: Record<string, unknown> = {
      id: 'p-1',
      session: { id: 'vs-1' },
      user: { id: 'u-1', name: 'Alice' },
      role: 'presenter',
      joinedAt: '2026-02-20T14:05:00Z',
      leftAt: '',
    };

    const result = formatParticipant(doc);
    expect(result.id).toBe('p-1');
    expect(result.sessionId).toBe('vs-1');
    expect(result.userId).toBe('u-1');
    expect(result.userName).toBe('Alice');
    expect(result.role).toBe('presenter');
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'p-2', session: 'vs-2', user: 'u-2',
    };
    const result = formatParticipant(doc);
    expect(result.sessionId).toBe('vs-2');
    expect(result.userName).toBe('');
  });
});

describe('formatBreakoutRoom', () => {
  it('maps a full breakout room', () => {
    const doc: Record<string, unknown> = {
      id: 'br-1',
      session: 'vs-1',
      name: 'Team Alpha',
      capacity: 8,
      participantCount: 3,
      status: 'open',
      createdAt: '2026-02-20T14:10:00Z',
    };

    const result = formatBreakoutRoom(doc);
    expect(result.id).toBe('br-1');
    expect(result.name).toBe('Team Alpha');
    expect(result.capacity).toBe(8);
    expect(result.participantCount).toBe(3);
    expect(result.status).toBe('open');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'br-2' };
    const result = formatBreakoutRoom(doc);
    expect(result.name).toBe('');
    expect(result.capacity).toBe(10);
    expect(result.status).toBe('open');
  });
});

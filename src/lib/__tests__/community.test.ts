import { describe, it, expect } from 'vitest';
import { formatProfile, formatActivity, formatMessage } from '../community';

describe('formatProfile', () => {
  it('maps a full profile document', () => {
    const doc: Record<string, unknown> = {
      id: 'p-1',
      user: 'user-1',
      displayName: 'Alice',
      bio: 'Software engineer',
      avatarUrl: 'https://example.com/avatar.jpg',
      interests: ['coding', 'music'],
      isPublic: true,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatProfile(doc);
    expect(result.id).toBe('p-1');
    expect(result.displayName).toBe('Alice');
    expect(result.bio).toBe('Software engineer');
    expect(result.interests).toEqual(['coding', 'music']);
    expect(result.isPublic).toBe(true);
  });

  it('handles object user reference', () => {
    const doc: Record<string, unknown> = {
      id: 'p-2', user: { id: 'u-2', name: 'Bob' }, createdAt: '',
    };
    expect(formatProfile(doc).userId).toBe('u-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'p-3' };
    const result = formatProfile(doc);
    expect(result.displayName).toBe('');
    expect(result.bio).toBe('');
    expect(result.interests).toEqual([]);
    expect(result.isPublic).toBe(false);
  });
});

describe('formatActivity', () => {
  it('maps a full activity with object user', () => {
    const doc: Record<string, unknown> = {
      id: 'a-1',
      user: { id: 'u-1', name: 'Alice' },
      action: 'completed',
      targetType: 'course',
      targetId: 'c-1',
      targetTitle: 'Intro to JS',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatActivity(doc);
    expect(result.userId).toBe('u-1');
    expect(result.userName).toBe('Alice');
    expect(result.action).toBe('completed');
    expect(result.targetTitle).toBe('Intro to JS');
  });

  it('handles string user reference', () => {
    const doc: Record<string, unknown> = {
      id: 'a-2', user: 'u-2', action: 'enrolled',
      targetType: 'course', targetId: 'c-2', targetTitle: 'Math',
    };
    const result = formatActivity(doc);
    expect(result.userId).toBe('u-2');
    expect(result.userName).toBe('');
  });
});

describe('formatMessage', () => {
  it('maps a full message with object refs', () => {
    const doc: Record<string, unknown> = {
      id: 'm-1',
      sender: { id: 'u-1', name: 'Alice' },
      recipient: { id: 'u-2', name: 'Bob' },
      subject: 'Hello',
      body: 'How are you?',
      isRead: false,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatMessage(doc);
    expect(result.senderName).toBe('Alice');
    expect(result.recipientName).toBe('Bob');
    expect(result.subject).toBe('Hello');
    expect(result.isRead).toBe(false);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'm-2' };
    const result = formatMessage(doc);
    expect(result.subject).toBe('');
    expect(result.body).toBe('');
    expect(result.isRead).toBe(false);
  });
});

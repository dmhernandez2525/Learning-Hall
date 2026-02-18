import { describe, it, expect } from 'vitest';
import { formatNotification, formatDigestConfig, formatPushSubscription } from '../notifications';

describe('formatNotification', () => {
  it('maps a full notification document', () => {
    const doc: Record<string, unknown> = {
      id: 'n-1',
      user: 'user-1',
      type: 'success',
      title: 'Course completed',
      message: 'You finished React Basics',
      isRead: true,
      link: '/courses/react',
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatNotification(doc);
    expect(result.id).toBe('n-1');
    expect(result.userId).toBe('user-1');
    expect(result.type).toBe('success');
    expect(result.title).toBe('Course completed');
    expect(result.isRead).toBe(true);
    expect(result.link).toBe('/courses/react');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'n-2',
      user: { id: 'u-5' },
      createdAt: '',
    };
    const result = formatNotification(doc);
    expect(result.userId).toBe('u-5');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'n-3' };
    const result = formatNotification(doc);
    expect(result.type).toBe('info');
    expect(result.title).toBe('');
    expect(result.message).toBe('');
    expect(result.isRead).toBe(false);
    expect(result.link).toBe('');
  });
});

describe('formatDigestConfig', () => {
  it('maps a full digest config', () => {
    const doc: Record<string, unknown> = {
      id: 'dc-1',
      user: 'user-1',
      frequency: 'daily',
      isEnabled: true,
      lastSentAt: '2026-02-14T08:00:00Z',
    };

    const result = formatDigestConfig(doc);
    expect(result.id).toBe('dc-1');
    expect(result.frequency).toBe('daily');
    expect(result.isEnabled).toBe(true);
    expect(result.lastSentAt).toBe('2026-02-14T08:00:00Z');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'dc-2',
      user: { id: 'u-3' },
    };
    const result = formatDigestConfig(doc);
    expect(result.userId).toBe('u-3');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'dc-3' };
    const result = formatDigestConfig(doc);
    expect(result.frequency).toBe('weekly');
    expect(result.isEnabled).toBe(false);
  });
});

describe('formatPushSubscription', () => {
  it('maps a full push subscription', () => {
    const doc: Record<string, unknown> = {
      id: 'ps-1',
      user: 'user-1',
      endpoint: 'https://push.example.com/sub/123',
      keys: { p256dh: 'key1', auth: 'key2' },
      isActive: true,
      createdAt: '2026-02-10T00:00:00Z',
    };

    const result = formatPushSubscription(doc);
    expect(result.id).toBe('ps-1');
    expect(result.endpoint).toBe('https://push.example.com/sub/123');
    expect(result.keys).toContain('p256dh');
    expect(result.isActive).toBe(true);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ps-2' };
    const result = formatPushSubscription(doc);
    expect(result.endpoint).toBe('');
    expect(result.isActive).toBe(false);
  });
});

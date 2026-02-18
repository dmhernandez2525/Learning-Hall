import { describe, it, expect } from 'vitest';
import { formatSearchResult, formatSavedSearch } from '../advanced-search';

describe('formatSearchResult', () => {
  it('maps a full search result document', () => {
    const doc: Record<string, unknown> = {
      id: 'c-1',
      title: 'Intro to JavaScript',
      description: 'Learn the basics of JavaScript programming.',
      _score: 0.95,
    };

    const result = formatSearchResult(doc, 'course');
    expect(result.id).toBe('c-1');
    expect(result.type).toBe('course');
    expect(result.title).toBe('Intro to JavaScript');
    expect(result.excerpt).toBe('Learn the basics of JavaScript programming.');
    expect(result.score).toBe(0.95);
    expect(result.url).toBe('/courses/c-1');
  });

  it('uses name fallback for title', () => {
    const doc: Record<string, unknown> = { id: 'u-1', name: 'Alice' };
    const result = formatSearchResult(doc, 'user');
    expect(result.title).toBe('Alice');
    expect(result.url).toBe('/users/u-1');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'x-1' };
    const result = formatSearchResult(doc, 'lesson');
    expect(result.title).toBe('');
    expect(result.excerpt).toBe('');
    expect(result.score).toBe(1);
    expect(result.highlightedFields).toEqual([]);
  });
});

describe('formatSavedSearch', () => {
  it('maps a full saved search', () => {
    const doc: Record<string, unknown> = {
      id: 'ss-1',
      user: 'user-1',
      name: 'My JS Search',
      query: 'javascript',
      filters: [{ field: 'type', operator: 'equals', value: 'course' }],
      resultCount: 15,
      lastRunAt: '2026-02-01T00:00:00Z',
    };

    const result = formatSavedSearch(doc);
    expect(result.id).toBe('ss-1');
    expect(result.name).toBe('My JS Search');
    expect(result.query).toBe('javascript');
    expect(result.filters).toHaveLength(1);
    expect(result.resultCount).toBe(15);
  });

  it('handles object user reference', () => {
    const doc: Record<string, unknown> = {
      id: 'ss-2', user: { id: 'u-2', name: 'Bob' },
    };
    expect(formatSavedSearch(doc).userId).toBe('u-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ss-3' };
    const result = formatSavedSearch(doc);
    expect(result.name).toBe('');
    expect(result.query).toBe('');
    expect(result.filters).toEqual([]);
    expect(result.resultCount).toBe(0);
  });
});

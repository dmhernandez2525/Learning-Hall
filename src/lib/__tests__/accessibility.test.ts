import { describe, it, expect } from 'vitest';
import { formatAudit, formatKeyboardAudit, formatScreenReaderConfig } from '../accessibility';

describe('formatAudit', () => {
  it('maps a full audit document', () => {
    const doc: Record<string, unknown> = {
      id: 'audit-1',
      course: 'course-1',
      lesson: 'lesson-1',
      auditor: 'user-1',
      wcagLevel: 'AA',
      score: 85,
      issues: [{ rule: 'img-alt', severity: 'error', element: 'img', description: 'Missing alt', suggestion: 'Add alt text' }],
      status: 'completed',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatAudit(doc);
    expect(result.id).toBe('audit-1');
    expect(result.wcagLevel).toBe('AA');
    expect(result.score).toBe(85);
    expect(result.issues).toHaveLength(1);
    expect(result.status).toBe('completed');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'audit-2',
      course: { id: 'c-2' },
      lesson: { id: 'l-2' },
      auditor: { id: 'u-2' },
      createdAt: '',
    };
    const result = formatAudit(doc);
    expect(result.courseId).toBe('c-2');
    expect(result.lessonId).toBe('l-2');
    expect(result.auditorId).toBe('u-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'audit-3' };
    const result = formatAudit(doc);
    expect(result.wcagLevel).toBe('AA');
    expect(result.score).toBe(0);
    expect(result.issues).toEqual([]);
    expect(result.status).toBe('pending');
  });
});

describe('formatKeyboardAudit', () => {
  it('maps a full keyboard audit', () => {
    const doc: Record<string, unknown> = {
      id: 'ka-1',
      pageUrl: '/courses/1',
      tabOrder: ['nav', 'main', 'footer'],
      trappedElements: ['modal'],
      missingFocus: [],
      passed: true,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatKeyboardAudit(doc);
    expect(result.pageUrl).toBe('/courses/1');
    expect(result.tabOrder).toHaveLength(3);
    expect(result.trappedElements).toEqual(['modal']);
    expect(result.passed).toBe(true);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ka-2' };
    const result = formatKeyboardAudit(doc);
    expect(result.pageUrl).toBe('');
    expect(result.tabOrder).toEqual([]);
    expect(result.passed).toBe(false);
  });
});

describe('formatScreenReaderConfig', () => {
  it('maps a full screen reader config', () => {
    const doc: Record<string, unknown> = {
      id: 'sr-1',
      course: 'course-1',
      ariaLandmarks: true,
      altTextCoverage: 95,
      headingHierarchy: true,
      liveRegions: false,
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatScreenReaderConfig(doc);
    expect(result.ariaLandmarks).toBe(true);
    expect(result.altTextCoverage).toBe(95);
    expect(result.headingHierarchy).toBe(true);
    expect(result.liveRegions).toBe(false);
  });
});

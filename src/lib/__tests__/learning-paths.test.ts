import { describe, it, expect } from 'vitest';
import type { PathStep, PathStepProgress } from '@/types/learning-paths';
import { resolveStepStatuses } from '@/lib/learning-paths';

describe('resolveStepStatuses', () => {
  const steps: PathStep[] = [
    { stepId: 's1', courseId: 'c1', courseTitle: 'Intro', order: 0, isRequired: true, prerequisiteStepIds: [] },
    { stepId: 's2', courseId: 'c2', courseTitle: 'Intermediate', order: 1, isRequired: true, prerequisiteStepIds: ['s1'] },
    { stepId: 's3', courseId: 'c3', courseTitle: 'Advanced', order: 2, isRequired: true, prerequisiteStepIds: ['s2'] },
  ];

  it('marks first step as available when no courses completed', () => {
    const result = resolveStepStatuses(steps, new Set());
    expect(result[0].status).toBe('available');
    expect(result[1].status).toBe('locked');
    expect(result[2].status).toBe('locked');
  });

  it('unlocks next step when prerequisite is completed', () => {
    const result = resolveStepStatuses(steps, new Set(['c1']));
    expect(result[0].status).toBe('completed');
    expect(result[1].status).toBe('available');
    expect(result[2].status).toBe('locked');
  });

  it('marks all as completed when all courses done', () => {
    const result = resolveStepStatuses(steps, new Set(['c1', 'c2', 'c3']));
    expect(result.every((s) => s.status === 'completed')).toBe(true);
  });

  it('handles steps with no prerequisites', () => {
    const parallel: PathStep[] = [
      { stepId: 's1', courseId: 'c1', courseTitle: 'A', order: 0, isRequired: true, prerequisiteStepIds: [] },
      { stepId: 's2', courseId: 'c2', courseTitle: 'B', order: 1, isRequired: true, prerequisiteStepIds: [] },
    ];
    const result = resolveStepStatuses(parallel, new Set());
    expect(result[0].status).toBe('available');
    expect(result[1].status).toBe('available');
  });

  it('handles multiple prerequisites', () => {
    const multiPrereq: PathStep[] = [
      { stepId: 's1', courseId: 'c1', courseTitle: 'A', order: 0, isRequired: true, prerequisiteStepIds: [] },
      { stepId: 's2', courseId: 'c2', courseTitle: 'B', order: 1, isRequired: true, prerequisiteStepIds: [] },
      { stepId: 's3', courseId: 'c3', courseTitle: 'Final', order: 2, isRequired: true, prerequisiteStepIds: ['s1', 's2'] },
    ];

    const partialResult = resolveStepStatuses(multiPrereq, new Set(['c1']));
    expect(partialResult[2].status).toBe('locked');

    const fullResult = resolveStepStatuses(multiPrereq, new Set(['c1', 'c2']));
    expect(fullResult[2].status).toBe('available');
  });

  it('sets completion percent to 100 for completed steps', () => {
    const result = resolveStepStatuses(steps, new Set(['c1']));
    expect(result[0].completionPercent).toBe(100);
    expect(result[1].completionPercent).toBe(0);
  });

  it('returns empty array for empty steps', () => {
    expect(resolveStepStatuses([], new Set())).toEqual([]);
  });
});

describe('overall progress calculation', () => {
  function calculateOverallPercent(steps: PathStepProgress[]): number {
    if (steps.length === 0) return 0;
    const completed = steps.filter((s) => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  }

  it('returns 0 for no progress', () => {
    const steps: PathStepProgress[] = [
      { stepId: 's1', courseId: 'c1', status: 'available', completionPercent: 0 },
      { stepId: 's2', courseId: 'c2', status: 'locked', completionPercent: 0 },
    ];
    expect(calculateOverallPercent(steps)).toBe(0);
  });

  it('returns 50 for half complete', () => {
    const steps: PathStepProgress[] = [
      { stepId: 's1', courseId: 'c1', status: 'completed', completionPercent: 100 },
      { stepId: 's2', courseId: 'c2', status: 'available', completionPercent: 0 },
    ];
    expect(calculateOverallPercent(steps)).toBe(50);
  });

  it('returns 100 for all complete', () => {
    const steps: PathStepProgress[] = [
      { stepId: 's1', courseId: 'c1', status: 'completed', completionPercent: 100 },
      { stepId: 's2', courseId: 'c2', status: 'completed', completionPercent: 100 },
    ];
    expect(calculateOverallPercent(steps)).toBe(100);
  });

  it('returns 0 for empty steps', () => {
    expect(calculateOverallPercent([])).toBe(0);
  });
});

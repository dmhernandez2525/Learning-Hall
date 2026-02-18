import { describe, it, expect } from 'vitest';
import type { DripScheduleItem, CohortLeaderboardEntry } from '@/types/cohorts';
import { getUnlockedModules, sortAndRankLeaderboard } from '@/lib/cohorts';

describe('getUnlockedModules', () => {
  const schedule: DripScheduleItem[] = [
    { moduleId: 'm1', unlockDate: '2026-01-01T00:00:00Z' },
    { moduleId: 'm2', unlockDate: '2026-02-01T00:00:00Z' },
    { moduleId: 'm3', unlockDate: '2026-03-01T00:00:00Z' },
    { moduleId: 'm4', unlockDate: '2026-06-01T00:00:00Z' },
  ];

  it('returns all modules when now is after all unlock dates', () => {
    const now = new Date('2026-07-01T00:00:00Z');
    const result = getUnlockedModules(schedule, now);
    expect(result).toEqual(['m1', 'm2', 'm3', 'm4']);
  });

  it('returns no modules when now is before all unlock dates', () => {
    const now = new Date('2025-12-01T00:00:00Z');
    const result = getUnlockedModules(schedule, now);
    expect(result).toEqual([]);
  });

  it('returns partial modules based on current date', () => {
    const now = new Date('2026-02-15T00:00:00Z');
    const result = getUnlockedModules(schedule, now);
    expect(result).toEqual(['m1', 'm2']);
  });

  it('includes module unlocking on exact unlock date', () => {
    const now = new Date('2026-03-01T00:00:00Z');
    const result = getUnlockedModules(schedule, now);
    expect(result).toEqual(['m1', 'm2', 'm3']);
  });

  it('returns empty array for empty schedule', () => {
    const result = getUnlockedModules([], new Date());
    expect(result).toEqual([]);
  });

  it('handles single module schedule', () => {
    const single: DripScheduleItem[] = [
      { moduleId: 'only', unlockDate: '2026-01-15T00:00:00Z' },
    ];
    const before = getUnlockedModules(single, new Date('2026-01-14T00:00:00Z'));
    const after = getUnlockedModules(single, new Date('2026-01-16T00:00:00Z'));
    expect(before).toEqual([]);
    expect(after).toEqual(['only']);
  });

  it('handles millisecond precision at unlock boundary', () => {
    const precise: DripScheduleItem[] = [
      { moduleId: 'p1', unlockDate: '2026-04-10T12:00:00.000Z' },
    ];
    const exactMs = getUnlockedModules(precise, new Date('2026-04-10T12:00:00.000Z'));
    expect(exactMs).toEqual(['p1']);

    const beforeMs = getUnlockedModules(precise, new Date('2026-04-10T11:59:59.999Z'));
    expect(beforeMs).toEqual([]);
  });
});

describe('sortAndRankLeaderboard', () => {
  it('sorts entries by completion percent descending and assigns ranks', () => {
    const entries: CohortLeaderboardEntry[] = [
      { userId: 'u1', displayName: 'Alice', completionPercent: 50, rank: 0 },
      { userId: 'u2', displayName: 'Bob', completionPercent: 90, rank: 0 },
      { userId: 'u3', displayName: 'Carol', completionPercent: 75, rank: 0 },
    ];
    const result = sortAndRankLeaderboard(entries);
    expect(result[0].userId).toBe('u2');
    expect(result[0].rank).toBe(1);
    expect(result[1].userId).toBe('u3');
    expect(result[1].rank).toBe(2);
    expect(result[2].userId).toBe('u1');
    expect(result[2].rank).toBe(3);
  });

  it('returns empty array for empty input', () => {
    expect(sortAndRankLeaderboard([])).toEqual([]);
  });

  it('handles single entry', () => {
    const entries: CohortLeaderboardEntry[] = [
      { userId: 'u1', displayName: 'Solo', completionPercent: 100, rank: 0 },
    ];
    const result = sortAndRankLeaderboard(entries);
    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
    expect(result[0].completionPercent).toBe(100);
  });

  it('handles entries with equal completion percent', () => {
    const entries: CohortLeaderboardEntry[] = [
      { userId: 'u1', displayName: 'Alice', completionPercent: 80, rank: 0 },
      { userId: 'u2', displayName: 'Bob', completionPercent: 80, rank: 0 },
      { userId: 'u3', displayName: 'Carol', completionPercent: 60, rank: 0 },
    ];
    const result = sortAndRankLeaderboard(entries);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(3);
    expect(result[0].completionPercent).toBe(80);
    expect(result[1].completionPercent).toBe(80);
    expect(result[2].completionPercent).toBe(60);
  });

  it('handles all entries at zero percent', () => {
    const entries: CohortLeaderboardEntry[] = [
      { userId: 'u1', displayName: 'Alice', completionPercent: 0, rank: 0 },
      { userId: 'u2', displayName: 'Bob', completionPercent: 0, rank: 0 },
    ];
    const result = sortAndRankLeaderboard(entries);
    expect(result.every((e) => e.completionPercent === 0)).toBe(true);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
  });

  it('does not mutate the original array', () => {
    const entries: CohortLeaderboardEntry[] = [
      { userId: 'u1', displayName: 'Alice', completionPercent: 30, rank: 0 },
      { userId: 'u2', displayName: 'Bob', completionPercent: 70, rank: 0 },
    ];
    const original = [...entries];
    sortAndRankLeaderboard(entries);
    expect(entries).toEqual(original);
  });
});

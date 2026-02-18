import { describe, it, expect } from 'vitest';
import type { RubricScore } from '@/types/assignments';

describe('assignment analytics helpers', () => {
  describe('score distribution', () => {
    function buildScoreDistribution(scores: number[], maxScore: number) {
      const ranges = [
        { range: '0-20%', min: 0, max: maxScore * 0.2 },
        { range: '21-40%', min: maxScore * 0.2, max: maxScore * 0.4 },
        { range: '41-60%', min: maxScore * 0.4, max: maxScore * 0.6 },
        { range: '61-80%', min: maxScore * 0.6, max: maxScore * 0.8 },
        { range: '81-100%', min: maxScore * 0.8, max: maxScore + 1 },
      ];
      return ranges.map(({ range, min, max }) => ({
        range,
        count: scores.filter((s) => s >= min && s < max).length,
      }));
    }

    it('distributes scores into 5 buckets', () => {
      const dist = buildScoreDistribution([10, 30, 50, 70, 90], 100);
      expect(dist).toHaveLength(5);
      expect(dist[0].count).toBe(1); // 10 in 0-20
      expect(dist[1].count).toBe(1); // 30 in 21-40
      expect(dist[2].count).toBe(1); // 50 in 41-60
      expect(dist[3].count).toBe(1); // 70 in 61-80
      expect(dist[4].count).toBe(1); // 90 in 81-100
    });

    it('handles empty scores', () => {
      const dist = buildScoreDistribution([], 100);
      expect(dist.every((d) => d.count === 0)).toBe(true);
    });

    it('handles all same score', () => {
      const dist = buildScoreDistribution([50, 50, 50], 100);
      expect(dist[2].count).toBe(3);
    });

    it('handles perfect scores', () => {
      const dist = buildScoreDistribution([100, 100], 100);
      expect(dist[4].count).toBe(2);
    });
  });

  describe('criteria averages', () => {
    function calculateCriteriaAverages(
      rubric: Array<{ criterionId: string; title: string; maxPoints: number }>,
      submissions: Array<{ rubricScores: RubricScore[] }>
    ) {
      return rubric.map((criterion) => {
        const scores = submissions
          .map((s) => s.rubricScores.find((rs) => rs.criterionId === criterion.criterionId))
          .filter((rs): rs is RubricScore => rs != null)
          .map((rs) => rs.score);

        const average = scores.length > 0
          ? Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2))
          : 0;

        return {
          criterionId: criterion.criterionId,
          title: criterion.title,
          average,
          maxPoints: criterion.maxPoints,
        };
      });
    }

    it('calculates averages per criterion', () => {
      const rubric = [
        { criterionId: 'c1', title: 'Quality', maxPoints: 50 },
        { criterionId: 'c2', title: 'Completeness', maxPoints: 50 },
      ];
      const submissions = [
        { rubricScores: [{ criterionId: 'c1', score: 40, comment: '' }, { criterionId: 'c2', score: 45, comment: '' }] },
        { rubricScores: [{ criterionId: 'c1', score: 30, comment: '' }, { criterionId: 'c2', score: 35, comment: '' }] },
      ];

      const result = calculateCriteriaAverages(rubric, submissions);
      expect(result[0].average).toBe(35);
      expect(result[1].average).toBe(40);
    });

    it('returns 0 average for no submissions', () => {
      const rubric = [{ criterionId: 'c1', title: 'Test', maxPoints: 10 }];
      const result = calculateCriteriaAverages(rubric, []);
      expect(result[0].average).toBe(0);
    });
  });

  describe('late submission detection', () => {
    it('detects late submission', () => {
      const dueDate = '2026-01-01T00:00:00Z';
      const submittedAt = '2026-01-02T00:00:00Z';
      expect(new Date(submittedAt) > new Date(dueDate)).toBe(true);
    });

    it('detects on-time submission', () => {
      const dueDate = '2026-01-10T00:00:00Z';
      const submittedAt = '2026-01-05T00:00:00Z';
      expect(new Date(submittedAt) > new Date(dueDate)).toBe(false);
    });
  });
});

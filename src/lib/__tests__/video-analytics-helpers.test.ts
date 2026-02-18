import { describe, it, expect } from 'vitest';

describe('video analytics helpers', () => {
  describe('heatmap bin creation', () => {
    function createHeatmapBins(duration: number, binSize: number) {
      const bins: Array<{ start: number; end: number; views: number }> = [];
      const safeDuration = Math.max(duration, binSize);
      for (let start = 0; start < safeDuration; start += binSize) {
        bins.push({ start, end: Math.min(start + binSize, safeDuration), views: 0 });
      }
      return bins;
    }

    it('creates correct number of bins for given duration', () => {
      const bins = createHeatmapBins(100, 10);
      expect(bins).toHaveLength(10);
      expect(bins[0]).toEqual({ start: 0, end: 10, views: 0 });
      expect(bins[9]).toEqual({ start: 90, end: 100, views: 0 });
    });

    it('handles duration smaller than binSize', () => {
      const bins = createHeatmapBins(5, 10);
      expect(bins).toHaveLength(1);
      expect(bins[0]).toEqual({ start: 0, end: 10, views: 0 });
    });

    it('creates bins where last bin may be shorter', () => {
      const bins = createHeatmapBins(15, 10);
      expect(bins).toHaveLength(2);
      expect(bins[1]).toEqual({ start: 10, end: 15, views: 0 });
    });
  });

  describe('heatmap population', () => {
    function buildHeatmap(positions: number[], duration: number) {
      if (positions.length === 0) return [];
      const inferredDuration = duration > 0 ? duration : Math.max(...positions, 60);
      const binSize = Math.max(10, Math.ceil(inferredDuration / 20));
      const bins: Array<{ start: number; end: number; views: number }> = [];
      const safeDuration = Math.max(inferredDuration, binSize);
      for (let start = 0; start < safeDuration; start += binSize) {
        bins.push({ start, end: Math.min(start + binSize, safeDuration), views: 0 });
      }
      positions.forEach((position) => {
        const safePosition = Math.max(0, position);
        const index = Math.min(Math.floor(safePosition / binSize), bins.length - 1);
        if (bins[index]) bins[index].views += 1;
      });
      return bins;
    }

    it('returns empty array for no positions', () => {
      expect(buildHeatmap([], 100)).toEqual([]);
    });

    it('assigns positions to correct bins', () => {
      const bins = buildHeatmap([5, 15, 25, 5, 5], 60);
      expect(bins).toHaveLength(6);
      expect(bins[0].views).toBe(3);
      expect(bins[1].views).toBe(1);
      expect(bins[2].views).toBe(1);
    });

    it('handles negative positions by clamping to 0', () => {
      const bins = buildHeatmap([-10, 0, 5], 60);
      expect(bins[0].views).toBe(3);
    });

    it('clamps positions beyond duration to last bin', () => {
      const bins = buildHeatmap([100], 60);
      const lastBin = bins[bins.length - 1];
      expect(lastBin.views).toBe(1);
    });
  });

  describe('completion rate calculation', () => {
    function calculateCompletionRate(positions: number[], duration: number): number {
      const totalViews = positions.length;
      if (totalViews === 0 || duration <= 0) return 0;
      const completionCount = positions.filter((p) => p >= duration * 0.9).length;
      return Number(((completionCount / totalViews) * 100).toFixed(2));
    }

    it('returns 0 for no views', () => {
      expect(calculateCompletionRate([], 100)).toBe(0);
    });

    it('returns 0 for zero duration', () => {
      expect(calculateCompletionRate([50], 0)).toBe(0);
    });

    it('calculates correct rate', () => {
      const positions = [10, 50, 91, 95, 100];
      expect(calculateCompletionRate(positions, 100)).toBe(60);
    });

    it('returns 100 when all complete', () => {
      expect(calculateCompletionRate([95, 96, 97], 100)).toBe(100);
    });
  });
});

describe('VTT parsing', () => {
  function parseVttCues(vtt: string) {
    if (!vtt.trim()) return [];
    const cues: Array<{ start: string; end: string; text: string }> = [];
    const blocks = vtt.split(/\n\n+/);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const timeLine = lines.find((line) => line.includes('-->'));
      if (!timeLine) continue;
      const [start, end] = timeLine.split('-->').map((s) => s.trim());
      const textIndex = lines.indexOf(timeLine) + 1;
      const text = lines.slice(textIndex).join(' ').trim();
      if (start && end && text) cues.push({ start, end, text });
    }
    return cues;
  }

  it('returns empty array for empty string', () => {
    expect(parseVttCues('')).toEqual([]);
  });

  it('parses simple VTT', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:05.000
Hello world

00:00:05.000 --> 00:00:10.000
Second line`;

    const cues = parseVttCues(vtt);
    expect(cues).toHaveLength(2);
    expect(cues[0].text).toBe('Hello world');
    expect(cues[1].start).toBe('00:00:05.000');
  });

  it('handles multiline cue text', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:05.000
Line one
Line two`;

    const cues = parseVttCues(vtt);
    expect(cues).toHaveLength(1);
    expect(cues[0].text).toBe('Line one Line two');
  });

  it('skips header-only blocks', () => {
    const vtt = `WEBVTT

NOTE This is a comment

00:00:00.000 --> 00:00:05.000
Actual content`;

    const cues = parseVttCues(vtt);
    expect(cues).toHaveLength(1);
    expect(cues[0].text).toBe('Actual content');
  });
});

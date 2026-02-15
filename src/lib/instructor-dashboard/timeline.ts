import type {
  DashboardDateRange,
  DashboardReviewRecord,
  DashboardTimelinePoint,
  RatingTrendPoint,
} from './types';
import { getTimelineBucket, type TimelineBucket } from './date-range';

export function roundTo(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return roundTo((numerator / denominator) * 100);
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function advanceCursor(cursor: Date, bucket: TimelineBucket): void {
  if (bucket === 'month') {
    cursor.setMonth(cursor.getMonth() + 1);
    return;
  }

  if (bucket === 'week') {
    cursor.setDate(cursor.getDate() + 7);
    return;
  }

  cursor.setDate(cursor.getDate() + 1);
}

function getBucketKey(date: Date, bucket: TimelineBucket): string {
  if (bucket === 'month') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  if (bucket === 'week') {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    return start.toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getBucketLabel(date: Date, bucket: TimelineBucket): string {
  const localeOptions: Intl.DateTimeFormatOptions =
    bucket === 'month'
      ? { month: 'short', year: '2-digit' }
      : { month: 'short', day: 'numeric' };

  return new Intl.DateTimeFormat('en-US', localeOptions).format(date);
}

function buildBuckets(dateRange: DashboardDateRange): Array<{ key: string; isoDate: string; label: string }> {
  const bucket = getTimelineBucket(dateRange.key);
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const cursor = new Date(start);
  const result: Array<{ key: string; isoDate: string; label: string }> = [];

  while (cursor <= end) {
    const key = getBucketKey(cursor, bucket);
    const label = getBucketLabel(cursor, bucket);
    result.push({ key, isoDate: cursor.toISOString(), label });
    advanceCursor(cursor, bucket);
  }

  return result;
}

export function buildTimeline(
  dateRange: DashboardDateRange,
  values: Array<{ createdAt: string; value: number }>
): DashboardTimelinePoint[] {
  const bucket = getTimelineBucket(dateRange.key);
  const bucketIndex = new Map<string, { isoDate: string; label: string; value: number }>();

  buildBuckets(dateRange).forEach((entry) => {
    bucketIndex.set(entry.key, { isoDate: entry.isoDate, label: entry.label, value: 0 });
  });

  values.forEach((entry) => {
    const date = new Date(entry.createdAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = getBucketKey(date, bucket);
    const current = bucketIndex.get(key);
    if (!current) {
      return;
    }

    current.value += entry.value;
  });

  return [...bucketIndex.values()].map((entry) => ({
    isoDate: entry.isoDate,
    label: entry.label,
    value: roundTo(entry.value, 2),
  }));
}

export function buildRatingTrend(
  dateRange: DashboardDateRange,
  reviews: DashboardReviewRecord[]
): RatingTrendPoint[] {
  const timeline = buildTimeline(
    dateRange,
    reviews.map((review) => ({
      createdAt: review.createdAt,
      value: review.rating,
    }))
  );

  const counts = buildTimeline(
    dateRange,
    reviews.map((review) => ({
      createdAt: review.createdAt,
      value: 1,
    }))
  );

  const points = timeline
    .map((entry, index) => {
      const reviewCount = counts[index]?.value ?? 0;
      const averageRating = reviewCount > 0 ? roundTo(entry.value / reviewCount, 2) : 0;
      return { ...entry, averageRating, reviewCount };
    })
    .filter((entry) => entry.reviewCount > 0);

  return points.map((entry, index) => {
    const windowStart = Math.max(0, index - 2);
    const rollingWindow = points.slice(windowStart, index + 1);
    const rollingAverage = roundTo(
      average(rollingWindow.map((windowEntry) => windowEntry.averageRating)),
      2
    );

    return {
      isoDate: entry.isoDate,
      label: entry.label,
      averageRating: entry.averageRating,
      rollingAverage,
      reviewCount: entry.reviewCount,
    };
  });
}


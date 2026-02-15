import type { DashboardDateRange, DashboardRangeKey } from './types';

const RANGE_TO_DAYS: Record<DashboardRangeKey, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
};

const RANGE_LABELS: Record<DashboardRangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '365d': 'Last 12 months',
};

export type TimelineBucket = 'day' | 'week' | 'month';

export function isDashboardRangeKey(value: string): value is DashboardRangeKey {
  return value in RANGE_TO_DAYS;
}

export function resolveDashboardDateRange(
  rangeKey?: string | null,
  now: Date = new Date()
): DashboardDateRange {
  const key = rangeKey && isDashboardRangeKey(rangeKey) ? rangeKey : '30d';
  const days = RANGE_TO_DAYS[key];
  const endDate = new Date(now);
  const startDate = new Date(now);

  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  return {
    key,
    label: RANGE_LABELS[key],
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

export function getTimelineBucket(rangeKey: DashboardRangeKey): TimelineBucket {
  if (rangeKey === '365d') {
    return 'month';
  }

  if (rangeKey === '90d') {
    return 'week';
  }

  return 'day';
}

export function getRangeDays(rangeKey: DashboardRangeKey): number {
  return RANGE_TO_DAYS[rangeKey];
}


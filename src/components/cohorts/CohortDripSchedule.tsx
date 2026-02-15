'use client';

import type { DripScheduleItem } from '@/types/cohorts';

interface CohortDripScheduleProps {
  schedule: DripScheduleItem[];
  cohortStartDate: string;
  cohortEndDate: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function isUnlocked(unlockDate: string): boolean {
  return new Date(unlockDate) <= new Date();
}

export function CohortDripSchedule({
  schedule,
  cohortStartDate,
  cohortEndDate,
}: CohortDripScheduleProps) {
  if (schedule.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No drip schedule configured for this cohort.
      </p>
    );
  }

  const sorted = [...schedule].sort(
    (a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
  );

  const start = new Date(cohortStartDate).getTime();
  const end = new Date(cohortEndDate).getTime();
  const totalRange = end - start;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Content Drip Timeline</h4>
      <div className="text-xs text-muted-foreground flex justify-between mb-1">
        <span>{formatDate(cohortStartDate)}</span>
        <span>{formatDate(cohortEndDate)}</span>
      </div>
      <div className="relative h-3 rounded-full bg-muted">
        {sorted.map((item) => {
          const unlockTime = new Date(item.unlockDate).getTime();
          const position = totalRange > 0
            ? Math.min(Math.max(((unlockTime - start) / totalRange) * 100, 0), 100)
            : 0;
          const unlocked = isUnlocked(item.unlockDate);

          return (
            <div
              key={item.moduleId}
              className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 ${
                unlocked
                  ? 'bg-green-500 border-green-600'
                  : 'bg-white border-gray-400'
              }`}
              style={{ left: `calc(${position}% - 8px)` }}
              title={`Module ${item.moduleId}: ${formatDate(item.unlockDate)}`}
            />
          );
        })}
      </div>
      <ul className="space-y-2 mt-4">
        {sorted.map((item) => {
          const unlocked = isUnlocked(item.unlockDate);
          return (
            <li key={item.moduleId} className="flex items-center gap-2 text-sm">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  unlocked ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className="font-medium">Module {item.moduleId}</span>
              <span className="text-muted-foreground">
                {unlocked ? 'Unlocked' : `Unlocks ${formatDate(item.unlockDate)}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

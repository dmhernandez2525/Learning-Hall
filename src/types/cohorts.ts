export interface DripScheduleItem {
  moduleId: string;
  unlockDate: string;
}

export interface CohortMember {
  id: string;
  cohortId: string;
  userId: string;
  enrolledAt: string;
  role: 'student' | 'facilitator';
}

export interface Cohort {
  id: string;
  title: string;
  courseId: string;
  startDate: string;
  endDate: string;
  maxMembers: number;
  memberCount: number;
  status: 'active' | 'upcoming' | 'completed';
  dripSchedule: DripScheduleItem[];
}

export interface ModuleUnlockStatus {
  moduleId: string;
  unlockDate: string;
  isUnlocked: boolean;
}

export interface CohortAnalytics {
  totalMembers: number;
  activeCount: number;
  averageProgress: number;
  completionRate: number;
  moduleUnlockStatus: ModuleUnlockStatus[];
}

export interface CohortLeaderboardEntry {
  userId: string;
  displayName: string;
  completionPercent: number;
  rank: number;
}

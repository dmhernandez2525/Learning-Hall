import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  Cohort,
  CohortMember,
  CohortAnalytics,
  CohortLeaderboardEntry,
  DripScheduleItem,
  ModuleUnlockStatus,
} from '@/types/cohorts';

function mapDripSchedule(value: unknown): DripScheduleItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      moduleId: String(row.moduleId ?? ''),
      unlockDate: String(row.unlockDate ?? ''),
    };
  });
}

export function formatCohort(doc: Record<string, unknown>): Cohort {
  const course = doc.course as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    startDate: String(doc.startDate ?? ''),
    endDate: String(doc.endDate ?? ''),
    maxMembers: Number(doc.maxMembers ?? 30),
    memberCount: Number(doc.memberCount ?? 0),
    status: (doc.status as Cohort['status']) ?? 'upcoming',
    dripSchedule: mapDripSchedule(doc.dripSchedule),
  };
}

export async function listCohortsForCourse(courseId: string): Promise<Cohort[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'cohorts',
    where: { course: { equals: courseId } },
    sort: '-startDate',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatCohort(doc as Record<string, unknown>));
}

export async function getCohort(id: string): Promise<Cohort | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'cohorts', id, depth: 1 });
    if (!doc) return null;
    return formatCohort(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateCohortInput {
  title: string;
  courseId: string;
  startDate: string;
  endDate: string;
  maxMembers?: number;
  dripSchedule?: Array<{ moduleId: string; unlockDate: string }>;
}

export async function createCohort(
  input: CreateCohortInput,
  user: User
): Promise<Cohort> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'cohorts',
    data: {
      title: input.title,
      course: input.courseId,
      instructor: user.id,
      tenant: user.tenant,
      startDate: input.startDate,
      endDate: input.endDate,
      maxMembers: input.maxMembers ?? 30,
      memberCount: 0,
      status: 'upcoming',
      dripSchedule: (input.dripSchedule ?? []).map((s) => ({
        moduleId: s.moduleId,
        unlockDate: s.unlockDate,
      })),
      members: [],
    },
  });
  return formatCohort(doc as Record<string, unknown>);
}

export async function joinCohort(
  cohortId: string,
  user: User
): Promise<CohortMember> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection: 'cohorts', id: cohortId, depth: 0 });
  const raw = doc as Record<string, unknown>;

  const members = Array.isArray(raw.members) ? raw.members : [];
  const alreadyMember = members.some((m) => {
    const member = m as Record<string, unknown>;
    const userId = typeof member.user === 'object'
      ? String((member.user as Record<string, unknown>).id)
      : String(member.user);
    return userId === user.id;
  });

  if (alreadyMember) {
    throw new Error('Already a member of this cohort');
  }

  const currentCount = Number(raw.memberCount ?? 0);
  const maxMembers = Number(raw.maxMembers ?? 30);
  if (currentCount >= maxMembers) {
    throw new Error('Cohort is full');
  }

  const enrolledAt = new Date().toISOString();
  const newMember = { user: user.id, role: 'student', enrolledAt };

  await payload.update({
    collection: 'cohorts',
    id: cohortId,
    data: {
      members: [...members, newMember],
      memberCount: currentCount + 1,
    },
  });

  return {
    id: `${cohortId}-${user.id}`,
    cohortId,
    userId: user.id,
    enrolledAt,
    role: 'student',
  };
}

export async function getCohortAnalytics(
  cohortId: string
): Promise<CohortAnalytics> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection: 'cohorts', id: cohortId, depth: 0 });
  const raw = doc as Record<string, unknown>;

  const members = Array.isArray(raw.members) ? raw.members : [];
  const totalMembers = members.length;
  const dripSchedule = mapDripSchedule(raw.dripSchedule);
  const now = new Date();

  const moduleUnlockStatus: ModuleUnlockStatus[] = dripSchedule.map((item) => ({
    moduleId: item.moduleId,
    unlockDate: item.unlockDate,
    isUnlocked: new Date(item.unlockDate) <= now,
  }));

  const courseId = typeof raw.course === 'object'
    ? String((raw.course as Record<string, unknown>).id)
    : String(raw.course ?? '');

  let totalProgress = 0;
  let completedCount = 0;

  for (const m of members) {
    const member = m as Record<string, unknown>;
    const userId = typeof member.user === 'object'
      ? String((member.user as Record<string, unknown>).id)
      : String(member.user);

    const progressResult = await payload.find({
      collection: 'course-progress',
      where: {
        and: [
          { user: { equals: userId } },
          { course: { equals: courseId } },
        ],
      },
      limit: 1,
      depth: 0,
    });

    if (progressResult.docs.length > 0) {
      const prog = progressResult.docs[0] as Record<string, unknown>;
      const percent = Number(prog.progressPercentage ?? 0);
      totalProgress += percent;
      if (percent >= 100) completedCount += 1;
    }
  }

  const averageProgress = totalMembers > 0
    ? Math.round(totalProgress / totalMembers)
    : 0;
  const completionRate = totalMembers > 0
    ? Math.round((completedCount / totalMembers) * 100)
    : 0;

  return {
    totalMembers,
    activeCount: totalMembers - completedCount,
    averageProgress,
    completionRate,
    moduleUnlockStatus,
  };
}

export async function getCohortLeaderboard(
  cohortId: string
): Promise<CohortLeaderboardEntry[]> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection: 'cohorts', id: cohortId, depth: 1 });
  const raw = doc as Record<string, unknown>;

  const members = Array.isArray(raw.members) ? raw.members : [];
  const courseId = typeof raw.course === 'object'
    ? String((raw.course as Record<string, unknown>).id)
    : String(raw.course ?? '');

  const entries: CohortLeaderboardEntry[] = [];

  for (const m of members) {
    const member = m as Record<string, unknown>;
    const userObj = member.user as string | Record<string, unknown>;
    const userId = typeof userObj === 'object' ? String(userObj.id) : String(userObj);
    const displayName = typeof userObj === 'object'
      ? String((userObj as Record<string, unknown>).name ?? (userObj as Record<string, unknown>).email ?? userId)
      : userId;

    const progressResult = await payload.find({
      collection: 'course-progress',
      where: {
        and: [
          { user: { equals: userId } },
          { course: { equals: courseId } },
        ],
      },
      limit: 1,
      depth: 0,
    });

    let completionPercent = 0;
    if (progressResult.docs.length > 0) {
      const prog = progressResult.docs[0] as Record<string, unknown>;
      completionPercent = Number(prog.progressPercentage ?? 0);
    }

    entries.push({ userId, displayName, completionPercent, rank: 0 });
  }

  return sortAndRankLeaderboard(entries);
}

export function sortAndRankLeaderboard(
  entries: CohortLeaderboardEntry[]
): CohortLeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.completionPercent - a.completionPercent);
  return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function getUnlockedModules(
  dripSchedule: DripScheduleItem[],
  now?: Date
): string[] {
  const reference = now ?? new Date();
  return dripSchedule
    .filter((item) => new Date(item.unlockDate) <= reference)
    .map((item) => item.moduleId);
}

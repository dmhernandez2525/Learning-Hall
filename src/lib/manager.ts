import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  TrainingAssignment,
  TeamMemberProgress,
  ManagerDashboardData,
} from '@/types/manager';

// --------------- Formatters ---------------

export function formatAssignment(doc: Record<string, unknown>): TrainingAssignment {
  const manager = doc.manager as string | Record<string, unknown>;
  const user = doc.user as string | Record<string, unknown>;
  const course = doc.course as string | Record<string, unknown>;

  return {
    id: String(doc.id),
    managerId: typeof manager === 'object' ? String(manager.id) : String(manager ?? ''),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object' ? String((user as Record<string, unknown>).name ?? '') : '',
    userEmail: typeof user === 'object' ? String((user as Record<string, unknown>).email ?? '') : '',
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    courseName: typeof course === 'object' ? String((course as Record<string, unknown>).title ?? '') : '',
    dueDate: String(doc.dueDate ?? ''),
    status: (doc.status as TrainingAssignment['status']) ?? 'assigned',
    progressPercent: Number(doc.progressPercent ?? 0),
    assignedAt: String(doc.createdAt ?? ''),
    completedAt: doc.completedAt ? String(doc.completedAt) : null,
  };
}

// --------------- Training Assignments ---------------

export async function listAssignments(managerId: string): Promise<TrainingAssignment[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'training-assignments',
    where: { manager: { equals: managerId } },
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatAssignment(doc as Record<string, unknown>));
}

interface CreateAssignmentInput {
  userId: string;
  courseId: string;
  dueDate: string;
}

export async function createAssignment(
  input: CreateAssignmentInput,
  manager: User
): Promise<TrainingAssignment> {
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: 'training-assignments',
    where: {
      and: [
        { manager: { equals: manager.id } },
        { user: { equals: input.userId } },
        { course: { equals: input.courseId } },
      ],
    },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    return formatAssignment(existing.docs[0] as Record<string, unknown>);
  }

  const doc = await payload.create({
    collection: 'training-assignments',
    data: {
      manager: manager.id,
      user: input.userId,
      course: input.courseId,
      dueDate: input.dueDate,
      status: 'assigned',
      progressPercent: 0,
      tenant: manager.tenant,
    },
  });
  return formatAssignment(doc as Record<string, unknown>);
}

export async function updateAssignmentStatus(
  id: string,
  status: TrainingAssignment['status'],
  progressPercent?: number
): Promise<TrainingAssignment> {
  const payload = await getPayloadClient();
  const data: Record<string, unknown> = { status };
  if (progressPercent !== undefined) data.progressPercent = progressPercent;
  if (status === 'completed') data.completedAt = new Date().toISOString();

  const doc = await payload.update({
    collection: 'training-assignments',
    id,
    data,
  });
  return formatAssignment(doc as Record<string, unknown>);
}

// --------------- Team Progress ---------------

export async function getTeamProgress(managerId: string): Promise<TeamMemberProgress[]> {
  const payload = await getPayloadClient();

  const assignments = await payload.find({
    collection: 'training-assignments',
    where: { manager: { equals: managerId } },
    limit: 500,
    depth: 1,
  });

  const memberMap = new Map<string, TeamMemberProgress>();

  for (const doc of assignments.docs) {
    const raw = doc as Record<string, unknown>;
    const user = raw.user as Record<string, unknown> | string;
    const userId = typeof user === 'object' ? String(user.id) : String(user ?? '');
    const userName = typeof user === 'object' ? String(user.name ?? '') : '';
    const userEmail = typeof user === 'object' ? String(user.email ?? '') : '';
    const status = String(raw.status ?? '');
    const progress = Number(raw.progressPercent ?? 0);

    let member = memberMap.get(userId);
    if (!member) {
      member = {
        userId,
        userName,
        userEmail,
        enrolledCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        overdueAssignments: 0,
        lastActivity: null,
      };
      memberMap.set(userId, member);
    }

    member.enrolledCourses += 1;
    if (status === 'completed') member.completedCourses += 1;
    if (status === 'overdue') member.overdueAssignments += 1;
    member.averageProgress += progress;

    const updatedAt = String(raw.updatedAt ?? '');
    if (updatedAt && (!member.lastActivity || updatedAt > member.lastActivity)) {
      member.lastActivity = updatedAt;
    }
  }

  for (const member of memberMap.values()) {
    if (member.enrolledCourses > 0) {
      member.averageProgress = Math.round(member.averageProgress / member.enrolledCourses);
    }
  }

  return [...memberMap.values()];
}

// --------------- Dashboard ---------------

export async function getManagerDashboard(managerId: string): Promise<ManagerDashboardData> {
  const payload = await getPayloadClient();

  const assignments = await payload.find({
    collection: 'training-assignments',
    where: { manager: { equals: managerId } } as Where,
    limit: 500,
    depth: 1,
  });

  let completedCount = 0;
  let overdueCount = 0;
  const memberIds = new Set<string>();

  for (const doc of assignments.docs) {
    const raw = doc as Record<string, unknown>;
    const status = String(raw.status ?? '');
    const user = raw.user as Record<string, unknown> | string;
    const userId = typeof user === 'object' ? String(user.id) : String(user ?? '');

    memberIds.add(userId);
    if (status === 'completed') completedCount += 1;
    if (status === 'overdue') overdueCount += 1;
  }

  const total = assignments.totalDocs;
  const teamMembers = await getTeamProgress(managerId);

  return {
    teamSize: memberIds.size,
    totalAssignments: total,
    completedAssignments: completedCount,
    overdueAssignments: overdueCount,
    completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
    teamMembers,
  };
}

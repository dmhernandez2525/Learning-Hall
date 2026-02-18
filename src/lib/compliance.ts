import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  ComplianceRequirement,
  ComplianceAssignment,
  ComplianceReport,
} from '@/types/compliance';

export function formatRequirement(doc: Record<string, unknown>): ComplianceRequirement {
  const course = doc.course as string | Record<string, unknown>;
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    dueDate: String(doc.dueDate ?? ''),
    isRequired: Boolean(doc.isRequired ?? true),
    status: (doc.status as ComplianceRequirement['status']) ?? 'draft',
    assigneeCount: Number(doc.assigneeCount ?? 0),
    completionCount: Number(doc.completionCount ?? 0),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatAssignment(doc: Record<string, unknown>): ComplianceAssignment {
  const requirement = doc.requirement as string | Record<string, unknown>;
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    requirementId: typeof requirement === 'object' ? String(requirement.id) : String(requirement ?? ''),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object'
      ? String((user as Record<string, unknown>).name ?? '')
      : '',
    userEmail: typeof user === 'object'
      ? String((user as Record<string, unknown>).email ?? '')
      : '',
    status: (doc.status as ComplianceAssignment['status']) ?? 'pending',
    dueDate: String(doc.dueDate ?? ''),
    completedAt: doc.completedAt ? String(doc.completedAt) : null,
    courseProgressPercent: Number(doc.courseProgressPercent ?? 0),
  };
}

// --------------- Requirements ---------------

export async function listRequirements(
  orgId?: string
): Promise<ComplianceRequirement[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'compliance-requirements',
    where,
    sort: '-dueDate',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatRequirement(doc as Record<string, unknown>));
}

export async function getRequirement(id: string): Promise<ComplianceRequirement | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'compliance-requirements', id, depth: 0 });
    if (!doc) return null;
    return formatRequirement(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateRequirementInput {
  title: string;
  description?: string;
  courseId: string;
  organizationId: string;
  dueDate: string;
  isRequired?: boolean;
}

export async function createRequirement(
  input: CreateRequirementInput,
  user: User
): Promise<ComplianceRequirement> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'compliance-requirements',
    data: {
      title: input.title,
      description: input.description ?? '',
      course: input.courseId,
      organization: input.organizationId,
      dueDate: input.dueDate,
      isRequired: input.isRequired ?? true,
      status: 'draft',
      assigneeCount: 0,
      completionCount: 0,
      tenant: user.tenant,
    },
  });
  return formatRequirement(doc as Record<string, unknown>);
}

export async function updateRequirement(
  id: string,
  data: Partial<CreateRequirementInput & { status: ComplianceRequirement['status'] }>
): Promise<ComplianceRequirement> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.courseId) {
    updateData.course = data.courseId;
    delete updateData.courseId;
  }
  if (data.organizationId) {
    updateData.organization = data.organizationId;
    delete updateData.organizationId;
  }
  const doc = await payload.update({
    collection: 'compliance-requirements',
    id,
    data: updateData,
  });
  return formatRequirement(doc as Record<string, unknown>);
}

// --------------- Assignments ---------------

export async function assignRequirement(
  requirementId: string,
  userIds: string[],
  user: User
): Promise<number> {
  const payload = await getPayloadClient();
  const req = await payload.findByID({
    collection: 'compliance-requirements',
    id: requirementId,
    depth: 0,
  });
  const raw = req as Record<string, unknown>;
  const dueDate = String(raw.dueDate ?? '');

  let created = 0;
  for (const userId of userIds) {
    const existing = await payload.find({
      collection: 'compliance-assignments',
      where: {
        and: [
          { requirement: { equals: requirementId } },
          { user: { equals: userId } },
        ],
      },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) continue;

    await payload.create({
      collection: 'compliance-assignments',
      data: {
        requirement: requirementId,
        user: userId,
        status: 'pending',
        dueDate,
        courseProgressPercent: 0,
        tenant: user.tenant,
      },
    });
    created += 1;
  }

  if (created > 0) {
    await payload.update({
      collection: 'compliance-requirements',
      id: requirementId,
      data: { assigneeCount: Number(raw.assigneeCount ?? 0) + created },
    });
  }

  return created;
}

export async function listAssignmentsForRequirement(
  requirementId: string
): Promise<ComplianceAssignment[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'compliance-assignments',
    where: { requirement: { equals: requirementId } },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
  });
  return result.docs.map((doc) => formatAssignment(doc as Record<string, unknown>));
}

export async function listAssignmentsForUser(
  userId: string
): Promise<ComplianceAssignment[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'compliance-assignments',
    where: { user: { equals: userId } },
    sort: '-dueDate',
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => formatAssignment(doc as Record<string, unknown>));
}

export async function completeAssignment(assignmentId: string): Promise<ComplianceAssignment> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'compliance-assignments',
    id: assignmentId,
    data: {
      status: 'completed',
      completedAt: new Date().toISOString(),
      courseProgressPercent: 100,
    },
  });

  const raw = doc as Record<string, unknown>;
  const reqId = typeof raw.requirement === 'object'
    ? String((raw.requirement as Record<string, unknown>).id)
    : String(raw.requirement ?? '');

  if (reqId) {
    const req = await payload.findByID({
      collection: 'compliance-requirements',
      id: reqId,
      depth: 0,
    });
    const reqRaw = req as Record<string, unknown>;
    await payload.update({
      collection: 'compliance-requirements',
      id: reqId,
      data: { completionCount: Number(reqRaw.completionCount ?? 0) + 1 },
    });
  }

  return formatAssignment(doc as Record<string, unknown>);
}

export async function checkOverdueAssignments(requirementId: string): Promise<number> {
  const payload = await getPayloadClient();
  const now = new Date().toISOString();

  const result = await payload.find({
    collection: 'compliance-assignments',
    where: {
      and: [
        { requirement: { equals: requirementId } },
        { status: { in: ['pending', 'in_progress'] } },
        { dueDate: { less_than: now } },
      ],
    },
    limit: 500,
    depth: 0,
  });

  let updated = 0;
  for (const doc of result.docs) {
    await payload.update({
      collection: 'compliance-assignments',
      id: String(doc.id),
      data: { status: 'overdue' },
    });
    updated += 1;
  }

  return updated;
}

// --------------- Report ---------------

export async function getComplianceReport(orgId?: string): Promise<ComplianceReport> {
  const payload = await getPayloadClient();

  const reqWhere: Where = orgId ? { organization: { equals: orgId } } : {};
  const requirements = await payload.find({
    collection: 'compliance-requirements',
    where: reqWhere,
    limit: 200,
    depth: 0,
  });

  const reqIds = requirements.docs.map((d) => String(d.id));

  let totalAssignments = 0;
  let completedCount = 0;
  let overdueCount = 0;
  let pendingCount = 0;

  for (const reqId of reqIds) {
    const assignments = await payload.find({
      collection: 'compliance-assignments',
      where: { requirement: { equals: reqId } },
      limit: 500,
      depth: 0,
    });

    for (const doc of assignments.docs) {
      const raw = doc as Record<string, unknown>;
      const status = String(raw.status ?? '');
      totalAssignments += 1;
      if (status === 'completed') completedCount += 1;
      else if (status === 'overdue') overdueCount += 1;
      else pendingCount += 1;
    }
  }

  return {
    totalAssignments,
    completedCount,
    overdueCount,
    pendingCount,
    completionRate: totalAssignments > 0
      ? Math.round((completedCount / totalAssignments) * 100)
      : 0,
    overdueRate: totalAssignments > 0
      ? Math.round((overdueCount / totalAssignments) * 100)
      : 0,
  };
}

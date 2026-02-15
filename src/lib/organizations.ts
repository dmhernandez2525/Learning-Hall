import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  Organization,
  Department,
  OrgMembership,
  BulkProvisionResult,
  OrgAnalytics,
} from '@/types/organizations';

export function formatOrganization(doc: Record<string, unknown>): Organization {
  const parent = doc.parent as string | Record<string, unknown> | undefined;
  const tenant = doc.tenant as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    name: String(doc.name ?? ''),
    slug: String(doc.slug ?? ''),
    parentId: parent
      ? (typeof parent === 'object' ? String(parent.id) : String(parent))
      : null,
    tenantId: typeof tenant === 'object' ? String(tenant.id) : String(tenant ?? ''),
    description: String(doc.description ?? ''),
    logoUrl: String(doc.logoUrl ?? ''),
    status: (doc.status as Organization['status']) ?? 'active',
    memberCount: Number(doc.memberCount ?? 0),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatDepartment(doc: Record<string, unknown>): Department {
  const org = doc.organization as string | Record<string, unknown>;
  const parentDept = doc.parentDepartment as string | Record<string, unknown> | undefined;
  const manager = doc.manager as string | Record<string, unknown> | undefined;
  return {
    id: String(doc.id),
    name: String(doc.name ?? ''),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    parentDepartmentId: parentDept
      ? (typeof parentDept === 'object' ? String(parentDept.id) : String(parentDept))
      : null,
    managerId: manager
      ? (typeof manager === 'object' ? String(manager.id) : String(manager))
      : null,
    managerName: manager && typeof manager === 'object'
      ? String((manager as Record<string, unknown>).name ?? '')
      : '',
    memberCount: Number(doc.memberCount ?? 0),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatMembership(doc: Record<string, unknown>): OrgMembership {
  const user = doc.user as string | Record<string, unknown>;
  const org = doc.organization as string | Record<string, unknown>;
  const dept = doc.department as string | Record<string, unknown> | undefined;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object'
      ? String((user as Record<string, unknown>).name ?? '')
      : '',
    userEmail: typeof user === 'object'
      ? String((user as Record<string, unknown>).email ?? '')
      : '',
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    departmentId: dept
      ? (typeof dept === 'object' ? String(dept.id) : String(dept))
      : null,
    role: (doc.role as OrgMembership['role']) ?? 'member',
    joinedAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Organizations ---------------

export async function listOrganizations(
  tenantId?: string
): Promise<Organization[]> {
  const payload = await getPayloadClient();
  const where: Where = tenantId ? { tenant: { equals: tenantId } } : {};
  const result = await payload.find({
    collection: 'organizations',
    where,
    sort: 'name',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatOrganization(doc as Record<string, unknown>));
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'organizations', id, depth: 0 });
    if (!doc) return null;
    return formatOrganization(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateOrgInput {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  parentId?: string;
}

export async function createOrganization(
  input: CreateOrgInput,
  user: User
): Promise<Organization> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'organizations',
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? '',
      logoUrl: input.logoUrl ?? '',
      parent: input.parentId,
      tenant: user.tenant,
      status: 'active',
      memberCount: 0,
    },
  });
  return formatOrganization(doc as Record<string, unknown>);
}

export async function updateOrganization(
  id: string,
  data: Partial<CreateOrgInput & { status: Organization['status'] }>
): Promise<Organization> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = { ...data };
  if (data.parentId !== undefined) {
    updateData.parent = data.parentId;
    delete updateData.parentId;
  }
  const doc = await payload.update({
    collection: 'organizations',
    id,
    data: updateData,
  });
  return formatOrganization(doc as Record<string, unknown>);
}

// --------------- Departments ---------------

export async function listDepartments(orgId: string): Promise<Department[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'departments',
    where: { organization: { equals: orgId } },
    sort: 'name',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatDepartment(doc as Record<string, unknown>));
}

interface CreateDeptInput {
  name: string;
  organizationId: string;
  parentDepartmentId?: string;
  managerId?: string;
}

export async function createDepartment(
  input: CreateDeptInput,
  user: User
): Promise<Department> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'departments',
    data: {
      name: input.name,
      organization: input.organizationId,
      parentDepartment: input.parentDepartmentId,
      manager: input.managerId,
      memberCount: 0,
      tenant: user.tenant,
    },
  });
  return formatDepartment(doc as Record<string, unknown>);
}

// --------------- Memberships ---------------

export async function listMembers(orgId: string): Promise<OrgMembership[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'org-memberships',
    where: { organization: { equals: orgId } },
    sort: '-createdAt',
    limit: 200,
    depth: 1,
  });
  return result.docs.map((doc) => formatMembership(doc as Record<string, unknown>));
}

export async function addMember(
  orgId: string,
  userId: string,
  role: OrgMembership['role'],
  departmentId: string | undefined,
  user: User
): Promise<OrgMembership> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'org-memberships',
    data: {
      user: userId,
      organization: orgId,
      department: departmentId,
      role,
      tenant: user.tenant,
    },
  });

  const org = await payload.findByID({ collection: 'organizations', id: orgId, depth: 0 });
  const raw = org as Record<string, unknown>;
  await payload.update({
    collection: 'organizations',
    id: orgId,
    data: { memberCount: Number(raw.memberCount ?? 0) + 1 },
  });

  return formatMembership(doc as Record<string, unknown>);
}

// --------------- Bulk Provisioning ---------------

interface BulkUserEntry {
  email: string;
  name: string;
  role?: OrgMembership['role'];
  departmentId?: string;
}

export async function bulkProvisionUsers(
  orgId: string,
  entries: BulkUserEntry[],
  user: User
): Promise<BulkProvisionResult> {
  const payload = await getPayloadClient();
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    try {
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: entry.email } },
        limit: 1,
        depth: 0,
      });

      let userId: string;
      if (existing.docs.length > 0) {
        userId = String(existing.docs[0].id);
      } else {
        const tempPassword = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: entry.email,
            name: entry.name,
            password: tempPassword,
            role: 'student',
          },
        });
        userId = String(newUser.id);
      }

      const existingMembership = await payload.find({
        collection: 'org-memberships',
        where: {
          and: [
            { user: { equals: userId } },
            { organization: { equals: orgId } },
          ],
        },
        limit: 1,
        depth: 0,
      });

      if (existingMembership.docs.length > 0) {
        skipped += 1;
        continue;
      }

      await addMember(orgId, userId, entry.role ?? 'member', entry.departmentId, user);
      created += 1;
    } catch (err) {
      errors.push(`Failed to provision ${entry.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { created, skipped, errors };
}

// --------------- Analytics ---------------

export async function getOrgAnalytics(orgId: string): Promise<OrgAnalytics> {
  const payload = await getPayloadClient();

  const members = await payload.find({
    collection: 'org-memberships',
    where: { organization: { equals: orgId } },
    limit: 500,
    depth: 0,
  });

  const departments = await payload.find({
    collection: 'departments',
    where: { organization: { equals: orgId } },
    limit: 100,
    depth: 0,
  });

  let totalProgress = 0;
  let progressCount = 0;

  for (const doc of members.docs) {
    const raw = doc as Record<string, unknown>;
    const userId = typeof raw.user === 'object'
      ? String((raw.user as Record<string, unknown>).id)
      : String(raw.user ?? '');

    const progress = await payload.find({
      collection: 'course-progress',
      where: { user: { equals: userId } },
      limit: 50,
      depth: 0,
    });

    for (const p of progress.docs) {
      const prog = p as Record<string, unknown>;
      totalProgress += Number(prog.progressPercentage ?? 0);
      progressCount += 1;
    }
  }

  return {
    totalMembers: members.docs.length,
    departmentCount: departments.docs.length,
    activeUsers: members.docs.length,
    averageCourseProgress: progressCount > 0
      ? Math.round(totalProgress / progressCount)
      : 0,
  };
}

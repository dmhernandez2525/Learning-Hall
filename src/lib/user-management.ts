import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  UserGroup,
  UserGroupMembership,
  CustomField,
  BulkImportResult,
  UserManagementAnalytics,
} from '@/types/user-management';

// --------------- Formatters ---------------

export function formatGroup(doc: Record<string, unknown>): UserGroup {
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    name: String(doc.name ?? ''),
    description: String(doc.description ?? ''),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    memberCount: Number(doc.memberCount ?? 0),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatMembership(doc: Record<string, unknown>): UserGroupMembership {
  const group = doc.group as string | Record<string, unknown>;
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    groupId: typeof group === 'object' ? String(group.id) : String(group ?? ''),
    groupName: typeof group === 'object' ? String((group as Record<string, unknown>).name ?? '') : '',
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object' ? String((user as Record<string, unknown>).name ?? '') : '',
    userEmail: typeof user === 'object' ? String((user as Record<string, unknown>).email ?? '') : '',
    joinedAt: String(doc.createdAt ?? ''),
  };
}

export function formatCustomField(doc: Record<string, unknown>): CustomField {
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    fieldName: String(doc.fieldName ?? ''),
    fieldType: (doc.fieldType as CustomField['fieldType']) ?? 'text',
    options: Array.isArray(doc.options) ? (doc.options as string[]) : [],
    isRequired: Boolean(doc.isRequired),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Groups ---------------

export async function listGroups(orgId?: string): Promise<UserGroup[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'user-groups',
    where,
    sort: 'name',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatGroup(doc as Record<string, unknown>));
}

interface CreateGroupInput {
  name: string;
  description?: string;
  organizationId: string;
}

export async function createGroup(input: CreateGroupInput, user: User): Promise<UserGroup> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'user-groups',
    data: {
      name: input.name,
      description: input.description ?? '',
      organization: input.organizationId,
      memberCount: 0,
      tenant: user.tenant,
    },
  });
  return formatGroup(doc as Record<string, unknown>);
}

export async function addGroupMember(groupId: string, userId: string, user: User): Promise<UserGroupMembership> {
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: 'user-group-members',
    where: {
      and: [
        { group: { equals: groupId } },
        { user: { equals: userId } },
      ],
    },
    limit: 1,
    depth: 1,
  });

  if (existing.docs.length > 0) {
    return formatMembership(existing.docs[0] as Record<string, unknown>);
  }

  const doc = await payload.create({
    collection: 'user-group-members',
    data: {
      group: groupId,
      user: userId,
      tenant: user.tenant,
    },
  });

  const group = await payload.findByID({ collection: 'user-groups', id: groupId, depth: 0 });
  const raw = group as Record<string, unknown>;
  await payload.update({
    collection: 'user-groups',
    id: groupId,
    data: { memberCount: Number(raw.memberCount ?? 0) + 1 },
  });

  return formatMembership(doc as Record<string, unknown>);
}

export async function listGroupMembers(groupId: string): Promise<UserGroupMembership[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'user-group-members',
    where: { group: { equals: groupId } },
    limit: 200,
    depth: 1,
  });
  return result.docs.map((doc) => formatMembership(doc as Record<string, unknown>));
}

// --------------- Custom Fields ---------------

export async function listCustomFields(orgId?: string): Promise<CustomField[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'custom-user-fields',
    where,
    sort: 'fieldName',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatCustomField(doc as Record<string, unknown>));
}

interface CreateFieldInput {
  organizationId: string;
  fieldName: string;
  fieldType: CustomField['fieldType'];
  options?: string[];
  isRequired?: boolean;
}

export async function createCustomField(input: CreateFieldInput, user: User): Promise<CustomField> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'custom-user-fields',
    data: {
      organization: input.organizationId,
      fieldName: input.fieldName,
      fieldType: input.fieldType,
      options: input.options ?? [],
      isRequired: input.isRequired ?? false,
      tenant: user.tenant,
    },
  });
  return formatCustomField(doc as Record<string, unknown>);
}

// --------------- Bulk Import ---------------

export async function bulkImportUsers(
  users: Array<{ email: string; name: string; role?: string }>,
  tenant?: string
): Promise<BulkImportResult> {
  const payload = await getPayloadClient();
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const u of users) {
    try {
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: u.email } },
        limit: 1,
        depth: 0,
      });

      if (existing.docs.length > 0) {
        skipped += 1;
        continue;
      }

      await payload.create({
        collection: 'users',
        data: {
          email: u.email,
          name: u.name,
          password: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          role: u.role ?? 'student',
          tenant: tenant ?? undefined,
        },
      });
      created += 1;
    } catch (err) {
      errors.push(`Failed: ${u.email} - ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return {
    totalProcessed: users.length,
    created,
    updated,
    skipped,
    errors,
  };
}

// --------------- Analytics ---------------

export async function getUserManagementAnalytics(): Promise<UserManagementAnalytics> {
  const payload = await getPayloadClient();

  const users = await payload.find({ collection: 'users', limit: 500, depth: 0 });
  const groups = await payload.find({ collection: 'user-groups', limit: 1, depth: 0 });
  const fields = await payload.find({ collection: 'custom-user-fields', limit: 1, depth: 0 });

  const usersByRole: Record<string, number> = {};
  let recentSignups = 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  for (const doc of users.docs) {
    const raw = doc as Record<string, unknown>;
    const role = String(raw.role ?? 'student');
    usersByRole[role] = (usersByRole[role] ?? 0) + 1;

    const createdAt = String(raw.createdAt ?? '');
    if (createdAt > sevenDaysAgo) recentSignups += 1;
  }

  return {
    totalUsers: users.totalDocs,
    totalGroups: groups.totalDocs,
    totalCustomFields: fields.totalDocs,
    usersByRole,
    recentSignups,
  };
}

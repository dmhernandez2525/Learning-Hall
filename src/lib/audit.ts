import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  AuditLogEntry,
  AuditRetentionPolicy,
  AuditAnalytics,
} from '@/types/audit';

// --------------- Formatters ---------------

export function formatLogEntry(doc: Record<string, unknown>): AuditLogEntry {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object' ? String((user as Record<string, unknown>).name ?? '') : '',
    action: String(doc.action ?? ''),
    resource: String(doc.resource ?? ''),
    resourceId: String(doc.resourceId ?? ''),
    details: (doc.details && typeof doc.details === 'object')
      ? (doc.details as Record<string, unknown>)
      : {},
    ipAddress: String(doc.ipAddress ?? ''),
    userAgent: String(doc.userAgent ?? ''),
    timestamp: String(doc.timestamp ?? ''),
  };
}

export function formatRetentionPolicy(doc: Record<string, unknown>): AuditRetentionPolicy {
  const org = doc.organization as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    retentionDays: Number(doc.retentionDays ?? 365),
    autoExport: Boolean(doc.autoExport),
    exportFormat: (doc.exportFormat as AuditRetentionPolicy['exportFormat']) ?? 'csv',
    isActive: Boolean(doc.isActive ?? true),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Audit Logs ---------------

export async function listAuditLogs(
  filters?: { userId?: string; action?: string; resource?: string; startDate?: string; endDate?: string }
): Promise<AuditLogEntry[]> {
  const payload = await getPayloadClient();
  const conditions: Where[] = [];

  if (filters?.userId) conditions.push({ user: { equals: filters.userId } });
  if (filters?.action) conditions.push({ action: { equals: filters.action } });
  if (filters?.resource) conditions.push({ resource: { equals: filters.resource } });
  if (filters?.startDate) conditions.push({ timestamp: { greater_than_equal: filters.startDate } });
  if (filters?.endDate) conditions.push({ timestamp: { less_than_equal: filters.endDate } });

  const where: Where = conditions.length > 0 ? { and: conditions } : {};

  const result = await payload.find({
    collection: 'audit-logs',
    where,
    sort: '-timestamp',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatLogEntry(doc as Record<string, unknown>));
}

interface CreateLogInput {
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: CreateLogInput, user: User): Promise<AuditLogEntry> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'audit-logs',
    data: {
      user: user.id,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      details: input.details ?? {},
      ipAddress: input.ipAddress ?? '',
      userAgent: input.userAgent ?? '',
      timestamp: new Date().toISOString(),
      tenant: user.tenant,
    },
  });
  return formatLogEntry(doc as Record<string, unknown>);
}

// --------------- Retention Policies ---------------

export async function listRetentionPolicies(orgId?: string): Promise<AuditRetentionPolicy[]> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};
  const result = await payload.find({
    collection: 'audit-retention-policies',
    where,
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatRetentionPolicy(doc as Record<string, unknown>));
}

interface CreateRetentionInput {
  organizationId: string;
  retentionDays: number;
  autoExport?: boolean;
  exportFormat?: AuditRetentionPolicy['exportFormat'];
}

export async function createRetentionPolicy(
  input: CreateRetentionInput,
  user: User
): Promise<AuditRetentionPolicy> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'audit-retention-policies',
    data: {
      organization: input.organizationId,
      retentionDays: input.retentionDays,
      autoExport: input.autoExport ?? false,
      exportFormat: input.exportFormat ?? 'csv',
      isActive: true,
      tenant: user.tenant,
    },
  });
  return formatRetentionPolicy(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getAuditAnalytics(): Promise<AuditAnalytics> {
  const payload = await getPayloadClient();

  const all = await payload.find({ collection: 'audit-logs', limit: 1, depth: 0 });

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const recent24h = await payload.find({
    collection: 'audit-logs',
    where: { timestamp: { greater_than_equal: last24h } },
    limit: 1,
    depth: 0,
  });

  const recent7d = await payload.find({
    collection: 'audit-logs',
    where: { timestamp: { greater_than_equal: last7d } },
    limit: 500,
    depth: 0,
  });

  const topActions: Record<string, number> = {};
  const topResources: Record<string, number> = {};

  for (const doc of recent7d.docs) {
    const raw = doc as Record<string, unknown>;
    const action = String(raw.action ?? '');
    const resource = String(raw.resource ?? '');
    topActions[action] = (topActions[action] ?? 0) + 1;
    topResources[resource] = (topResources[resource] ?? 0) + 1;
  }

  return {
    totalEntries: all.totalDocs,
    entriesLast24h: recent24h.totalDocs,
    entriesLast7d: recent7d.totalDocs,
    topActions,
    topResources,
  };
}

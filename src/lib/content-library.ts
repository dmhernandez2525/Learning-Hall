import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  ContentItem,
  ContentVersion,
  ContentApproval,
  ContentLibraryAnalytics,
} from '@/types/content-library';

// --------------- Formatters ---------------

export function formatItem(doc: Record<string, unknown>): ContentItem {
  const org = doc.organization as string | Record<string, unknown>;
  const creator = doc.createdBy as string | Record<string, unknown>;
  const currentVer = doc.currentVersion as string | Record<string, unknown> | null;
  const approver = doc.approvedBy as string | Record<string, unknown> | null;
  const tags = Array.isArray(doc.tags) ? (doc.tags as string[]) : [];

  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    contentType: (doc.contentType as ContentItem['contentType']) ?? 'document',
    organizationId: typeof org === 'object' ? String(org.id) : String(org ?? ''),
    createdBy: typeof creator === 'object' ? String(creator.id) : String(creator ?? ''),
    currentVersionId: currentVer
      ? (typeof currentVer === 'object' ? String(currentVer.id) : String(currentVer))
      : null,
    versionCount: Number(doc.versionCount ?? 0),
    tags,
    status: (doc.status as ContentItem['status']) ?? 'draft',
    approvedBy: approver
      ? (typeof approver === 'object' ? String(approver.id) : String(approver))
      : null,
    approvedAt: doc.approvedAt ? String(doc.approvedAt) : null,
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatVersion(doc: Record<string, unknown>): ContentVersion {
  const item = doc.contentItem as string | Record<string, unknown>;
  const creator = doc.createdBy as string | Record<string, unknown>;

  return {
    id: String(doc.id),
    contentItemId: typeof item === 'object' ? String(item.id) : String(item ?? ''),
    versionNumber: Number(doc.versionNumber ?? 1),
    changelog: String(doc.changelog ?? ''),
    fileUrl: String(doc.fileUrl ?? ''),
    fileSize: Number(doc.fileSize ?? 0),
    createdBy: typeof creator === 'object' ? String(creator.id) : String(creator ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatApproval(doc: Record<string, unknown>): ContentApproval {
  const item = doc.contentItem as string | Record<string, unknown>;
  const reviewer = doc.reviewer as string | Record<string, unknown>;

  return {
    id: String(doc.id),
    contentItemId: typeof item === 'object' ? String(item.id) : String(item ?? ''),
    reviewerId: typeof reviewer === 'object' ? String(reviewer.id) : String(reviewer ?? ''),
    reviewerName: typeof reviewer === 'object'
      ? String((reviewer as Record<string, unknown>).name ?? '')
      : '',
    decision: (doc.decision as ContentApproval['decision']) ?? 'needs_changes',
    comments: String(doc.comments ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Content Items ---------------

export async function listItems(orgId?: string, contentType?: string): Promise<ContentItem[]> {
  const payload = await getPayloadClient();
  const conditions: Where[] = [];
  if (orgId) conditions.push({ organization: { equals: orgId } });
  if (contentType) conditions.push({ contentType: { equals: contentType } });
  const where: Where = conditions.length > 0 ? { and: conditions } : {};

  const result = await payload.find({
    collection: 'content-items',
    where,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatItem(doc as Record<string, unknown>));
}

interface CreateItemInput {
  title: string;
  description?: string;
  contentType: ContentItem['contentType'];
  organizationId: string;
  tags?: string[];
}

export async function createItem(input: CreateItemInput, user: User): Promise<ContentItem> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'content-items',
    data: {
      title: input.title,
      description: input.description ?? '',
      contentType: input.contentType,
      organization: input.organizationId,
      createdBy: user.id,
      versionCount: 0,
      tags: input.tags ?? [],
      status: 'draft',
      tenant: user.tenant,
    },
  });
  return formatItem(doc as Record<string, unknown>);
}

// --------------- Versions ---------------

interface CreateVersionInput {
  contentItemId: string;
  changelog?: string;
  fileUrl: string;
  fileSize?: number;
}

export async function addVersion(input: CreateVersionInput, user: User): Promise<ContentVersion> {
  const payload = await getPayloadClient();

  const item = await payload.findByID({
    collection: 'content-items',
    id: input.contentItemId,
    depth: 0,
  });
  const raw = item as Record<string, unknown>;
  const nextVersion = Number(raw.versionCount ?? 0) + 1;

  const ver = await payload.create({
    collection: 'content-item-versions',
    data: {
      contentItem: input.contentItemId,
      versionNumber: nextVersion,
      changelog: input.changelog ?? '',
      fileUrl: input.fileUrl,
      fileSize: input.fileSize ?? 0,
      createdBy: user.id,
      tenant: user.tenant,
    },
  });

  await payload.update({
    collection: 'content-items',
    id: input.contentItemId,
    data: {
      currentVersion: String(ver.id),
      versionCount: nextVersion,
    },
  });

  return formatVersion(ver as Record<string, unknown>);
}

export async function listVersions(contentItemId: string): Promise<ContentVersion[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'content-item-versions',
    where: { contentItem: { equals: contentItemId } },
    sort: '-versionNumber',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatVersion(doc as Record<string, unknown>));
}

// --------------- Approvals ---------------

interface SubmitApprovalInput {
  contentItemId: string;
  decision: ContentApproval['decision'];
  comments?: string;
}

export async function submitApproval(input: SubmitApprovalInput, user: User): Promise<ContentApproval> {
  const payload = await getPayloadClient();

  const approval = await payload.create({
    collection: 'content-approvals',
    data: {
      contentItem: input.contentItemId,
      reviewer: user.id,
      decision: input.decision,
      comments: input.comments ?? '',
      tenant: user.tenant,
    },
  });

  if (input.decision === 'approved') {
    await payload.update({
      collection: 'content-items',
      id: input.contentItemId,
      data: {
        status: 'approved',
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
      },
    });
  } else if (input.decision === 'rejected') {
    await payload.update({
      collection: 'content-items',
      id: input.contentItemId,
      data: { status: 'draft' },
    });
  }

  return formatApproval(approval as Record<string, unknown>);
}

export async function listApprovals(contentItemId: string): Promise<ContentApproval[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'content-approvals',
    where: { contentItem: { equals: contentItemId } },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => formatApproval(doc as Record<string, unknown>));
}

// --------------- Analytics ---------------

export async function getContentLibraryAnalytics(orgId?: string): Promise<ContentLibraryAnalytics> {
  const payload = await getPayloadClient();
  const where: Where = orgId ? { organization: { equals: orgId } } : {};

  const items = await payload.find({
    collection: 'content-items',
    where,
    limit: 500,
    depth: 0,
  });

  let approvedItems = 0;
  let pendingReview = 0;
  let totalVersions = 0;
  const itemsByType: Record<string, number> = {};

  for (const doc of items.docs) {
    const raw = doc as Record<string, unknown>;
    const status = String(raw.status ?? '');
    const cType = String(raw.contentType ?? 'document');

    if (status === 'approved') approvedItems += 1;
    if (status === 'pending_review') pendingReview += 1;
    totalVersions += Number(raw.versionCount ?? 0);
    itemsByType[cType] = (itemsByType[cType] ?? 0) + 1;
  }

  return {
    totalItems: items.totalDocs,
    approvedItems,
    pendingReview,
    totalVersions,
    itemsByType,
  };
}

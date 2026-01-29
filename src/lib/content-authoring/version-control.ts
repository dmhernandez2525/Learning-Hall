// Version Control for Content
import { getPayload } from 'payload';
import config from '@/payload.config';
import * as crypto from 'crypto';

export interface ContentSnapshot {
  id: string;
  type: 'lesson' | 'course' | 'section' | 'quiz';
  title: string;
  content: unknown;
  metadata?: Record<string, unknown>;
}

export interface VersionInfo {
  versionNumber: number;
  changeType: 'major' | 'minor' | 'autosave' | 'manual' | 'publish';
  changeDescription?: string;
  createdAt: string;
  author: string;
}

// Create a new version of content
export async function createVersion(
  contentId: string,
  contentType: 'lesson' | 'course' | 'section' | 'quiz',
  content: unknown,
  options: {
    changeType?: 'major' | 'minor' | 'autosave' | 'manual' | 'publish';
    changeDescription?: string;
    authorId: string;
    tenantId?: string;
  }
): Promise<string> {
  const payload = await getPayload({ config });

  // Get the latest version number
  const latestVersions = await payload.find({
    collection: 'content-versions',
    where: {
      lesson: { equals: contentId },
    },
    sort: '-version',
    limit: 1,
  });

  const nextVersion = latestVersions.docs.length > 0
    ? (latestVersions.docs[0].version || 0) + 1
    : 1;

  // Calculate content checksum
  const checksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');

  // Create version
  const version = await payload.create({
    collection: 'content-versions',
    data: {
      lesson: contentId,
      version: nextVersion,
      contentJson: content,
      changeType: options.changeType || 'manual',
      changeDescription: options.changeDescription,
      author: options.authorId,
      status: 'draft',
      checksum,
      previousVersion: latestVersions.docs[0]?.id,
    },
  });

  return String(version.id);
}

// Get version history for content
export async function getVersionHistory(
  contentId: string,
  limit = 10
): Promise<VersionInfo[]> {
  const payload = await getPayload({ config });

  const versions = await payload.find({
    collection: 'content-versions',
    where: {
      lesson: { equals: contentId },
    },
    sort: '-version',
    limit,
    depth: 1,
  });

  return versions.docs.map((v) => ({
    versionNumber: v.version || 0,
    changeType: v.changeType as VersionInfo['changeType'] || 'manual',
    changeDescription: v.changeDescription || undefined,
    createdAt: v.createdAt,
    author: typeof v.author === 'object'
      ? String(v.author.id)
      : String(v.author),
  }));
}

// Restore content to a specific version
export async function restoreVersion(
  contentId: string,
  versionId: string,
  authorId: string
): Promise<void> {
  const payload = await getPayload({ config });

  // Get the version to restore
  const version = await payload.findByID({
    collection: 'content-versions',
    id: versionId,
  });

  if (!version) {
    throw new Error('Version not found');
  }

  // Update the lesson with the version content
  await payload.update({
    collection: 'lessons',
    id: contentId,
    data: {
      content: version.content,
      ...(version.metadata || {}),
    },
  });

  // Create a new version marking the rollback
  await createVersion(contentId, 'lesson', version.contentJson, {
    changeType: 'manual',
    changeDescription: `Restored to version ${version.version}`,
    authorId,
  });
}

// Compare two versions
export async function compareVersions(
  versionId1: string,
  versionId2: string
): Promise<{
  added: string[];
  removed: string[];
  modified: string[];
}> {
  const payload = await getPayload({ config });

  const [v1, v2] = await Promise.all([
    payload.findByID({ collection: 'content-versions', id: versionId1 }),
    payload.findByID({ collection: 'content-versions', id: versionId2 }),
  ]);

  if (!v1 || !v2) {
    throw new Error('One or both versions not found');
  }

  // Simple comparison (keys at top level)
  const content1 = (v1.contentJson as Record<string, unknown>) || {};
  const content2 = (v2.contentJson as Record<string, unknown>) || {};

  const keys1 = new Set(Object.keys(content1));
  const keys2 = new Set(Object.keys(content2));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  // Find added keys
  for (const key of keys2) {
    if (!keys1.has(key)) {
      added.push(key);
    }
  }

  // Find removed keys
  for (const key of keys1) {
    if (!keys2.has(key)) {
      removed.push(key);
    }
  }

  // Find modified keys
  for (const key of keys1) {
    if (keys2.has(key)) {
      if (JSON.stringify(content1[key]) !== JSON.stringify(content2[key])) {
        modified.push(key);
      }
    }
  }

  return { added, removed, modified };
}

// Publish a version
export async function publishVersion(
  versionId: string
): Promise<void> {
  const payload = await getPayload({ config });

  await payload.update({
    collection: 'content-versions',
    id: versionId,
    data: {
      status: 'published',
      publishedAt: new Date().toISOString(),
    },
  });
}

// Get the published version of content
export async function getPublishedVersion(
  contentId: string
): Promise<unknown | null> {
  const payload = await getPayload({ config });

  const versions = await payload.find({
    collection: 'content-versions',
    where: {
      lesson: { equals: contentId },
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    limit: 1,
  });

  if (versions.docs.length === 0) {
    return null;
  }

  return versions.docs[0].contentJson;
}

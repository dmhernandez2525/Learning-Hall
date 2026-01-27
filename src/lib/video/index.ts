import { getPayloadClient } from '@/lib/payload';
import { getDefaultStorageProvider, getStorageProviderForTenant } from '@/lib/storage';
import type {
  VideoUpload,
  VideoStatus,
  InitiateUploadResult,
  CompleteUploadResult,
  VideoUploadOptions,
  VideoMetadata,
} from './types';

export * from './types';

function generateStorageKey(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const sanitizedName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-');
  return `videos/${timestamp}-${random}/${sanitizedName}`;
}

function formatVideoUpload(doc: Record<string, unknown>): VideoUpload {
  const metadata = doc.metadata as Record<string, unknown> | null;
  const uploader = doc.uploader as Record<string, unknown> | string;

  return {
    id: String(doc.id),
    filename: String(doc.filename || ''),
    originalName: String(doc.originalName || ''),
    status: (doc.status as VideoStatus) || 'pending',
    progress: Number(doc.progress || 0),
    metadata: metadata
      ? {
          duration: metadata.duration ? Number(metadata.duration) : undefined,
          width: metadata.width ? Number(metadata.width) : undefined,
          height: metadata.height ? Number(metadata.height) : undefined,
          format: metadata.format ? String(metadata.format) : undefined,
          codec: metadata.codec ? String(metadata.codec) : undefined,
          bitrate: metadata.bitrate ? Number(metadata.bitrate) : undefined,
          frameRate: metadata.frameRate ? Number(metadata.frameRate) : undefined,
          size: Number(metadata.size || 0),
        }
      : undefined,
    storageKey: doc.storageKey ? String(doc.storageKey) : undefined,
    thumbnailKey: doc.thumbnailKey ? String(doc.thumbnailKey) : undefined,
    hlsPlaylistKey: doc.hlsPlaylistKey ? String(doc.hlsPlaylistKey) : undefined,
    error: doc.error ? String(doc.error) : undefined,
    uploaderId: typeof uploader === 'object' ? String(uploader.id) : String(uploader),
    tenantId: doc.tenant ? String(doc.tenant) : undefined,
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

/**
 * Create a video upload record and get a signed URL for direct upload
 */
export async function initiateVideoUpload(
  uploaderId: string,
  options: VideoUploadOptions
): Promise<InitiateUploadResult> {
  const payload = await getPayloadClient();

  // Generate storage key
  const storageKey = generateStorageKey(options.filename);

  // Create video record
  const videoDoc = await payload.create({
    collection: 'media',
    data: {
      filename: storageKey.split('/').pop(),
      mimeType: options.contentType,
      filesize: options.size,
      uploader: uploaderId,
      tenant: options.tenantId,
      // Custom fields for video tracking
      originalName: options.filename,
      storageKey,
      status: 'uploading',
      progress: 0,
    },
  });

  // Get storage provider
  const storage = options.tenantId
    ? await getStorageProviderForTenant(options.tenantId)
    : getDefaultStorageProvider();

  // Generate signed upload URL
  const signedUrl = await storage.getSignedUploadUrl(storageKey, {
    contentType: options.contentType,
    expiresIn: 3600, // 1 hour
  });

  const expiresAt = Math.floor(Date.now() / 1000) + 3600;

  return {
    uploadId: String(videoDoc.id),
    signedUrl,
    expiresAt,
  };
}

/**
 * Mark upload as complete and trigger processing
 */
export async function completeVideoUpload(
  uploadId: string,
  metadata?: Partial<VideoMetadata>
): Promise<CompleteUploadResult> {
  const payload = await getPayloadClient();

  try {
    const videoDoc = await payload.findByID({
      collection: 'media',
      id: uploadId,
    });

    if (!videoDoc) {
      return { success: false, error: 'Video not found' };
    }

    const doc = videoDoc as Record<string, unknown>;

    // In a production environment, we would:
    // 1. Set status to 'processing' and queue a job to transcode/extract metadata
    // 2. The job would update to 'ready' when complete
    // For development, we skip directly to 'ready' in a single update
    await payload.update({
      collection: 'media',
      id: uploadId,
      data: {
        status: 'ready',
        progress: 100,
        metadata: {
          ...metadata,
          size: doc.filesize || metadata?.size || 0,
        },
      },
    });

    const result = await payload.findByID({
      collection: 'media',
      id: uploadId,
    });

    return {
      success: true,
      video: formatVideoUpload(result as Record<string, unknown>),
    };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

/**
 * Mark upload as failed
 */
export async function failVideoUpload(
  uploadId: string,
  error: string
): Promise<void> {
  const payload = await getPayloadClient();

  await payload.update({
    collection: 'media',
    id: uploadId,
    data: {
      status: 'failed',
      error,
    },
  });
}

/**
 * Get video upload by ID
 */
export async function getVideoUpload(uploadId: string): Promise<VideoUpload | null> {
  const payload = await getPayloadClient();

  try {
    const result = await payload.findByID({
      collection: 'media',
      id: uploadId,
    });

    if (!result) return null;

    return formatVideoUpload(result as Record<string, unknown>);
  } catch {
    return null;
  }
}

/**
 * Update video upload progress
 */
export async function updateVideoProgress(
  uploadId: string,
  progress: number
): Promise<void> {
  const payload = await getPayloadClient();

  await payload.update({
    collection: 'media',
    id: uploadId,
    data: {
      progress: Math.min(100, Math.max(0, progress)),
    },
  });
}

/**
 * Get signed URL for video playback
 */
export async function getVideoPlaybackUrl(
  uploadId: string,
  tenantId?: string
): Promise<string | null> {
  const payload = await getPayloadClient();

  const result = await payload.findByID({
    collection: 'media',
    id: uploadId,
  });

  if (!result) return null;

  const doc = result as Record<string, unknown>;
  const storageKey = doc.storageKey as string | undefined;

  if (!storageKey) return null;

  const storage = tenantId
    ? await getStorageProviderForTenant(tenantId)
    : getDefaultStorageProvider();

  return storage.getSignedDownloadUrl(storageKey, {
    expiresIn: 3600 * 4, // 4 hours for video playback
    contentDisposition: 'inline',
  });
}

/**
 * Delete video and its files
 */
export async function deleteVideo(
  uploadId: string,
  tenantId?: string
): Promise<boolean> {
  const payload = await getPayloadClient();

  try {
    const result = await payload.findByID({
      collection: 'media',
      id: uploadId,
    });

    if (!result) return false;

    const doc = result as Record<string, unknown>;
    const storageKey = doc.storageKey as string | undefined;
    const thumbnailKey = doc.thumbnailKey as string | undefined;
    const hlsPlaylistKey = doc.hlsPlaylistKey as string | undefined;

    // Get storage provider
    const storage = tenantId
      ? await getStorageProviderForTenant(tenantId)
      : getDefaultStorageProvider();

    // Delete files from storage
    const keysToDelete: string[] = [];
    if (storageKey) keysToDelete.push(storageKey);
    if (thumbnailKey) keysToDelete.push(thumbnailKey);
    if (hlsPlaylistKey) {
      // HLS files are in a directory
      const hlsPrefix = hlsPlaylistKey.replace(/\/[^/]+$/, '/');
      const hlsFiles = await storage.list({ prefix: hlsPrefix });
      keysToDelete.push(...hlsFiles.objects.map((obj) => obj.key));
    }

    if (keysToDelete.length > 0) {
      await storage.deleteMany(keysToDelete);
    }

    // Delete record from database
    await payload.delete({
      collection: 'media',
      id: uploadId,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * List videos for a user
 */
export async function listVideos(
  uploaderId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ docs: VideoUpload[]; totalDocs: number; page: number }> {
  const payload = await getPayloadClient();
  const { page = 1, limit = 20 } = options;

  const result = await payload.find({
    collection: 'media',
    where: {
      uploader: { equals: uploaderId },
    },
    page,
    limit,
    sort: '-createdAt',
  });

  return {
    docs: result.docs.map((doc) => formatVideoUpload(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    page: result.page || 1,
  };
}

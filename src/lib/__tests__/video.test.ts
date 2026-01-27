import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Payload client
const mockPayload = {
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/payload', () => ({
  getPayloadClient: () => Promise.resolve(mockPayload),
}));

// Mock storage
const mockStorage = {
  getSignedUploadUrl: vi.fn().mockResolvedValue('https://signed-upload-url.example.com'),
  getSignedDownloadUrl: vi.fn().mockResolvedValue('https://signed-download-url.example.com'),
  list: vi.fn().mockResolvedValue({ objects: [] }),
  deleteMany: vi.fn().mockResolvedValue({ deleted: [], errors: [] }),
};

vi.mock('@/lib/storage', () => ({
  getDefaultStorageProvider: () => mockStorage,
  getStorageProviderForTenant: () => Promise.resolve(mockStorage),
}));

import {
  initiateVideoUpload,
  completeVideoUpload,
  failVideoUpload,
  getVideoUpload,
  deleteVideo,
  getVideoPlaybackUrl,
  listVideos,
} from '../video';

const mockVideoDoc = {
  id: 'video-123',
  filename: 'video.mp4',
  mimeType: 'video/mp4',
  filesize: 1024 * 1024 * 100, // 100MB
  originalName: 'my-video.mp4',
  storageKey: 'videos/123/video.mp4',
  status: 'ready',
  progress: 100,
  uploader: { id: 'user-1' },
  metadata: {
    duration: 300,
    width: 1920,
    height: 1080,
    size: 1024 * 1024 * 100,
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

describe('Video Upload Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateVideoUpload', () => {
    it('creates video record and returns signed URL', async () => {
      mockPayload.create.mockResolvedValue({ id: 'video-123' });

      const result = await initiateVideoUpload('user-1', {
        filename: 'my-video.mp4',
        contentType: 'video/mp4',
        size: 1024 * 1024 * 100,
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'media',
        data: expect.objectContaining({
          mimeType: 'video/mp4',
          filesize: 1024 * 1024 * 100,
          uploader: 'user-1',
          status: 'uploading',
          progress: 0,
        }),
      });

      expect(result.uploadId).toBe('video-123');
      expect(result.signedUrl).toBe('https://signed-upload-url.example.com');
      expect(result.expiresAt).toBeGreaterThan(Date.now() / 1000);
    });

    it('generates storage key with timestamp', async () => {
      mockPayload.create.mockResolvedValue({ id: 'video-123' });

      await initiateVideoUpload('user-1', {
        filename: 'My Video File.mp4',
        contentType: 'video/mp4',
        size: 1024,
      });

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'media',
        data: expect.objectContaining({
          storageKey: expect.stringMatching(/^videos\/\d+-[a-z0-9]+\/my-video-file\.mp4$/),
        }),
      });
    });
  });

  describe('completeVideoUpload', () => {
    it('updates video status to processing then ready', async () => {
      mockPayload.findByID.mockResolvedValue(mockVideoDoc);
      mockPayload.update.mockResolvedValue(mockVideoDoc);

      const result = await completeVideoUpload('video-123', {
        duration: 300,
        width: 1920,
        height: 1080,
      });

      expect(result.success).toBe(true);
      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'media',
        id: 'video-123',
        data: expect.objectContaining({
          status: 'processing',
          progress: 100,
        }),
      });
    });

    it('returns error if video not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const result = await completeVideoUpload('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Video not found');
    });
  });

  describe('failVideoUpload', () => {
    it('updates video status to failed with error message', async () => {
      mockPayload.update.mockResolvedValue(mockVideoDoc);

      await failVideoUpload('video-123', 'Upload timeout');

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'media',
        id: 'video-123',
        data: {
          status: 'failed',
          error: 'Upload timeout',
        },
      });
    });
  });

  describe('getVideoUpload', () => {
    it('returns formatted video upload', async () => {
      mockPayload.findByID.mockResolvedValue(mockVideoDoc);

      const video = await getVideoUpload('video-123');

      expect(video).not.toBeNull();
      expect(video?.id).toBe('video-123');
      expect(video?.status).toBe('ready');
      expect(video?.metadata?.duration).toBe(300);
    });

    it('returns null if video not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const video = await getVideoUpload('nonexistent');

      expect(video).toBeNull();
    });
  });

  describe('getVideoPlaybackUrl', () => {
    it('returns signed playback URL', async () => {
      mockPayload.findByID.mockResolvedValue(mockVideoDoc);

      const url = await getVideoPlaybackUrl('video-123');

      expect(url).toBe('https://signed-download-url.example.com');
      expect(mockStorage.getSignedDownloadUrl).toHaveBeenCalledWith(
        'videos/123/video.mp4',
        expect.objectContaining({
          expiresIn: 3600 * 4,
          contentDisposition: 'inline',
        })
      );
    });

    it('returns null if video not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const url = await getVideoPlaybackUrl('nonexistent');

      expect(url).toBeNull();
    });

    it('returns null if storage key not set', async () => {
      mockPayload.findByID.mockResolvedValue({ ...mockVideoDoc, storageKey: undefined });

      const url = await getVideoPlaybackUrl('video-123');

      expect(url).toBeNull();
    });
  });

  describe('deleteVideo', () => {
    it('deletes video files and record', async () => {
      mockPayload.findByID.mockResolvedValue(mockVideoDoc);
      mockPayload.delete.mockResolvedValue({});

      const success = await deleteVideo('video-123');

      expect(success).toBe(true);
      expect(mockStorage.deleteMany).toHaveBeenCalled();
      expect(mockPayload.delete).toHaveBeenCalledWith({
        collection: 'media',
        id: 'video-123',
      });
    });

    it('returns false if video not found', async () => {
      mockPayload.findByID.mockResolvedValue(null);

      const success = await deleteVideo('nonexistent');

      expect(success).toBe(false);
    });
  });

  describe('listVideos', () => {
    it('returns paginated video list', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [mockVideoDoc],
        totalDocs: 1,
        page: 1,
      });

      const result = await listVideos('user-1', { page: 1, limit: 20 });

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'media',
        where: { uploader: { equals: 'user-1' } },
        page: 1,
        limit: 20,
        sort: '-createdAt',
      });

      expect(result.docs).toHaveLength(1);
      expect(result.totalDocs).toBe(1);
    });
  });
});

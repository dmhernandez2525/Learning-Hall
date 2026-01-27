import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StorageConfig } from '../storage/types';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn(),
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  DeleteObjectsCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  CopyObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://signed-url.example.com'),
}));

// Mock fs
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(Buffer.from('test content')),
    unlink: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ size: 12, mtime: new Date() }),
    access: vi.fn().mockResolvedValue(undefined),
    copyFile: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
  },
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(Buffer.from('test content')),
  unlink: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue({ size: 12, mtime: new Date() }),
  access: vi.fn().mockResolvedValue(undefined),
  copyFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([]),
}));

// Mock path
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    default: actual,
  };
});

import { S3Provider } from '../storage/providers/s3';
import { LocalProvider } from '../storage/providers/local';
import { createProvider } from '../storage';

describe('Storage Abstraction', () => {
  describe('S3Provider', () => {
    let s3Config: StorageConfig;

    beforeEach(() => {
      vi.clearAllMocks();
      s3Config = {
        id: 's3-config',
        provider: 's3',
        bucket: 'test-bucket',
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
        isActive: true,
      };
    });

    it('creates S3 client with correct configuration', () => {
      const provider = new S3Provider(s3Config);
      expect(provider).toBeDefined();
    });

    it('creates S3 client with custom endpoint for R2', () => {
      const r2Config: StorageConfig = {
        ...s3Config,
        provider: 'r2',
        endpoint: 'https://account.r2.cloudflarestorage.com',
      };
      const provider = new S3Provider(r2Config);
      expect(provider).toBeDefined();
    });
  });

  describe('LocalProvider', () => {
    let localConfig: StorageConfig;

    beforeEach(() => {
      vi.clearAllMocks();
      localConfig = {
        id: 'local-config',
        provider: 'local',
        bucket: 'test-uploads',
        isActive: true,
      };
    });

    it('creates LocalProvider instance', () => {
      const provider = new LocalProvider(localConfig);
      expect(provider).toBeDefined();
    });

    it('generates signed download URL', async () => {
      const provider = new LocalProvider(localConfig);
      const url = await provider.getSignedDownloadUrl('test.txt');
      expect(url).toContain('/api/storage/download/');
      expect(url).toContain('expires=');
      expect(url).toContain('signature=');
    });

    it('generates signed upload URL', async () => {
      const provider = new LocalProvider(localConfig);
      const url = await provider.getSignedUploadUrl('test.txt');
      expect(url).toContain('/api/storage/upload/');
      expect(url).toContain('expires=');
      expect(url).toContain('signature=');
    });

    it('tests connection successfully', async () => {
      const provider = new LocalProvider(localConfig);
      const result = await provider.testConnection();
      expect(result.success).toBe(true);
    });
  });

  describe('createProvider', () => {
    it('creates S3Provider for s3 provider', () => {
      const config: StorageConfig = {
        id: 'test',
        provider: 's3',
        bucket: 'test',
        isActive: true,
      };
      const provider = createProvider(config);
      expect(provider).toBeInstanceOf(S3Provider);
    });

    it('creates S3Provider for r2 provider', () => {
      const config: StorageConfig = {
        id: 'test',
        provider: 'r2',
        bucket: 'test',
        endpoint: 'https://account.r2.cloudflarestorage.com',
        isActive: true,
      };
      const provider = createProvider(config);
      expect(provider).toBeInstanceOf(S3Provider);
    });

    it('creates S3Provider for b2 provider', () => {
      const config: StorageConfig = {
        id: 'test',
        provider: 'b2',
        bucket: 'test',
        endpoint: 'https://s3.us-west-000.backblazeb2.com',
        isActive: true,
      };
      const provider = createProvider(config);
      expect(provider).toBeInstanceOf(S3Provider);
    });

    it('creates S3Provider for minio provider', () => {
      const config: StorageConfig = {
        id: 'test',
        provider: 'minio',
        bucket: 'test',
        endpoint: 'http://localhost:9000',
        isActive: true,
      };
      const provider = createProvider(config);
      expect(provider).toBeInstanceOf(S3Provider);
    });

    it('creates LocalProvider for local provider', () => {
      const config: StorageConfig = {
        id: 'test',
        provider: 'local',
        bucket: 'test',
        isActive: true,
      };
      const provider = createProvider(config);
      expect(provider).toBeInstanceOf(LocalProvider);
    });

    it('throws for unsupported provider', () => {
      const config: StorageConfig = {
        id: 'test',
        provider: 'gcs',
        bucket: 'test',
        isActive: true,
      };
      expect(() => createProvider(config)).toThrow('GCS provider not yet implemented');
    });
  });
});

describe('StorageProviderInterface', () => {
  describe('LocalProvider full implementation', () => {
    let provider: LocalProvider;

    beforeEach(() => {
      vi.clearAllMocks();
      provider = new LocalProvider({
        id: 'local-test',
        provider: 'local',
        bucket: 'test-bucket',
        isActive: true,
      });
    });

    it('uploads a file', async () => {
      const fs = await import('fs/promises');
      const result = await provider.upload('test/file.txt', Buffer.from('test content'), {
        contentType: 'text/plain',
      });

      expect(fs.writeFile).toHaveBeenCalled();
      expect(result.key).toBe('test/file.txt');
      expect(result.contentType).toBe('text/plain');
      expect(result.size).toBe(12);
    });

    it('downloads a file', async () => {
      const result = await provider.download('test/file.txt');
      expect(result.body).toBeInstanceOf(Buffer);
      expect(result.contentLength).toBe(12);
    });

    it('deletes a file', async () => {
      const result = await provider.delete('test/file.txt');
      expect(result).toBe(true);
    });

    it('checks if file exists', async () => {
      const result = await provider.exists('test/file.txt');
      expect(result).toBe(true);
    });

    it('returns false for non-existent file', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await provider.exists('nonexistent.txt');
      expect(result).toBe(false);
    });

    it('copies a file', async () => {
      const result = await provider.copy('source.txt', 'dest.txt');
      expect(result).toBe(true);
    });

    it('gets file metadata', async () => {
      const result = await provider.getMetadata('test.txt');
      expect(result).not.toBeNull();
      expect(result?.size).toBe(12);
      expect(result?.contentType).toBe('application/octet-stream');
    });

    it('returns null for non-existent file metadata', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'));

      const result = await provider.getMetadata('nonexistent.txt');
      expect(result).toBeNull();
    });

    it('deletes multiple files', async () => {
      const result = await provider.deleteMany(['file1.txt', 'file2.txt']);
      expect(result.deleted).toContain('file1.txt');
      expect(result.deleted).toContain('file2.txt');
      expect(result.errors).toHaveLength(0);
    });

    it('handles empty delete many', async () => {
      const result = await provider.deleteMany([]);
      expect(result.deleted).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});

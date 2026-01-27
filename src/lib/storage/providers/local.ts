import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import type {
  StorageConfig,
  StorageProviderInterface,
  UploadOptions,
  UploadResult,
  DownloadResult,
  SignedUrlOptions,
  ListOptions,
  ListResult,
} from '../types';

export class LocalProvider implements StorageProviderInterface {
  private basePath: string;
  private baseUrl: string;
  private signatureSecret: string;

  constructor(config: StorageConfig) {
    // Use bucket as directory name
    this.basePath = path.join(process.cwd(), 'uploads', config.bucket);
    this.baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    this.signatureSecret = process.env.PAYLOAD_SECRET || 'local-dev-secret';
  }

  private async ensureDir(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  private getFullPath(key: string): string {
    // Prevent path traversal
    const safePath = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(this.basePath, safePath);
  }

  async upload(
    key: string,
    body: Buffer | ReadableStream<Uint8Array>,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const fullPath = this.getFullPath(key);
    await this.ensureDir(fullPath);

    // Convert stream to buffer if needed
    let buffer: Buffer;
    if (Buffer.isBuffer(body)) {
      buffer = body;
    } else {
      const stream = body as ReadableStream<Uint8Array>;
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      buffer = Buffer.concat(chunks);
    }

    await fs.writeFile(fullPath, buffer);

    // Write metadata
    const metadataPath = fullPath + '.meta.json';
    const metadata = {
      contentType: options.contentType || 'application/octet-stream',
      contentDisposition: options.contentDisposition,
      metadata: options.metadata,
      cacheControl: options.cacheControl,
      uploadedAt: new Date().toISOString(),
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    const etag = crypto.createHash('md5').update(buffer).digest('hex');

    return {
      key,
      url: `${this.baseUrl}/uploads/${path.basename(this.basePath)}/${key}`,
      bucket: path.basename(this.basePath),
      size: buffer.length,
      contentType: options.contentType || 'application/octet-stream',
      etag,
    };
  }

  async download(key: string): Promise<DownloadResult> {
    const fullPath = this.getFullPath(key);
    const metadataPath = fullPath + '.meta.json';

    const body = await fs.readFile(fullPath);

    let metadata: { contentType?: string } = {};
    try {
      const metaContent = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metaContent);
    } catch {
      // No metadata file
    }

    const stats = await fs.stat(fullPath);
    const etag = crypto.createHash('md5').update(body).digest('hex');

    return {
      body,
      contentType: metadata.contentType || 'application/octet-stream',
      contentLength: stats.size,
      lastModified: stats.mtime,
      etag,
    };
  }

  async delete(key: string): Promise<boolean> {
    const fullPath = this.getFullPath(key);
    const metadataPath = fullPath + '.meta.json';

    try {
      await fs.unlink(fullPath);
      try {
        await fs.unlink(metadataPath);
      } catch {
        // Metadata may not exist
      }
      return true;
    } catch {
      return false;
    }
  }

  async deleteMany(keys: string[]): Promise<{ deleted: string[]; errors: string[] }> {
    const deleted: string[] = [];
    const errors: string[] = [];

    for (const key of keys) {
      const success = await this.delete(key);
      if (success) {
        deleted.push(key);
      } else {
        errors.push(key);
      }
    }

    return { deleted, errors };
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.getFullPath(key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getSignedDownloadUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const expiresIn = options.expiresIn || 3600;
    const expires = Math.floor(Date.now() / 1000) + expiresIn;

    const data = `${key}:${expires}`;
    const signature = crypto
      .createHmac('sha256', this.signatureSecret)
      .update(data)
      .digest('hex');

    const params = new URLSearchParams({
      expires: String(expires),
      signature,
    });

    if (options.contentDisposition) {
      params.set('cd', options.contentDisposition);
    }

    return `${this.baseUrl}/api/storage/download/${encodeURIComponent(key)}?${params}`;
  }

  async getSignedUploadUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const expiresIn = options.expiresIn || 3600;
    const expires = Math.floor(Date.now() / 1000) + expiresIn;

    const data = `upload:${key}:${expires}`;
    const signature = crypto
      .createHmac('sha256', this.signatureSecret)
      .update(data)
      .digest('hex');

    const params = new URLSearchParams({
      expires: String(expires),
      signature,
    });

    if (options.contentType) {
      params.set('ct', options.contentType);
    }

    return `${this.baseUrl}/api/storage/upload/${encodeURIComponent(key)}?${params}`;
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    const prefix = options.prefix || '';
    const maxKeys = options.maxKeys || 1000;

    const results: ListResult['objects'] = [];

    async function* walk(dir: string): AsyncGenerator<string> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.endsWith('.meta.json')) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          yield* walk(fullPath);
        } else {
          yield fullPath;
        }
      }
    }

    try {
      for await (const filePath of walk(this.basePath)) {
        const key = path.relative(this.basePath, filePath);
        if (prefix && !key.startsWith(prefix)) continue;

        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath);
        const etag = crypto.createHash('md5').update(content).digest('hex');

        results.push({
          key,
          size: stats.size,
          lastModified: stats.mtime,
          etag,
        });

        if (results.length >= maxKeys) {
          return {
            objects: results,
            isTruncated: true,
            nextContinuationToken: key,
          };
        }
      }
    } catch {
      // Directory may not exist
    }

    return {
      objects: results,
      isTruncated: false,
    };
  }

  async getMetadata(key: string): Promise<{
    size: number;
    contentType: string;
    lastModified: Date;
    etag?: string;
    metadata?: Record<string, string>;
  } | null> {
    const fullPath = this.getFullPath(key);
    const metadataPath = fullPath + '.meta.json';

    try {
      const stats = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath);
      const etag = crypto.createHash('md5').update(content).digest('hex');

      let metadata: { contentType?: string; metadata?: Record<string, string> } = {};
      try {
        const metaContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metaContent);
      } catch {
        // No metadata file
      }

      return {
        size: stats.size,
        contentType: metadata.contentType || 'application/octet-stream',
        lastModified: stats.mtime,
        etag,
        metadata: metadata.metadata,
      };
    } catch {
      return null;
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<boolean> {
    const sourcePath = this.getFullPath(sourceKey);
    const destPath = this.getFullPath(destinationKey);
    const sourceMetaPath = sourcePath + '.meta.json';
    const destMetaPath = destPath + '.meta.json';

    try {
      await this.ensureDir(destPath);
      await fs.copyFile(sourcePath, destPath);

      try {
        await fs.copyFile(sourceMetaPath, destMetaPath);
      } catch {
        // Metadata may not exist
      }

      return true;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      const testFile = path.join(this.basePath, '.test-connection');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      return { success: true };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || 'Connection failed',
      };
    }
  }
}

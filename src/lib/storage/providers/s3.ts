import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export class S3Provider implements StorageProviderInterface {
  private client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;

    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: config.region || 'auto',
    };

    // Set endpoint for R2, B2, MinIO
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // Required for MinIO and B2
    }

    // Set credentials if provided
    if (config.credentials) {
      clientConfig.credentials = {
        accessKeyId: config.credentials.accessKeyId,
        secretAccessKey: config.credentials.secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  async upload(
    key: string,
    body: Buffer | ReadableStream<Uint8Array>,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body as Buffer,
      ContentType: options.contentType,
      ContentDisposition: options.contentDisposition,
      Metadata: options.metadata,
      CacheControl: options.cacheControl,
      ACL: options.acl,
    });

    const response = await this.client.send(command);

    // Get the size if body is a Buffer
    const size = body instanceof Buffer ? body.length : 0;

    return {
      key,
      url: this.getObjectUrl(key),
      bucket: this.bucket,
      size,
      contentType: options.contentType || 'application/octet-stream',
      etag: response.ETag?.replace(/"/g, ''),
    };
  }

  async download(key: string): Promise<DownloadResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('No body in response');
    }

    // Convert to Buffer
    const bodyBytes = await response.Body.transformToByteArray();
    const body = Buffer.from(bodyBytes);

    return {
      body,
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength || 0,
      lastModified: response.LastModified,
      etag: response.ETag?.replace(/"/g, ''),
    };
  }

  async delete(key: string): Promise<boolean> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    return true;
  }

  async deleteMany(keys: string[]): Promise<{ deleted: string[]; errors: string[] }> {
    if (keys.length === 0) {
      return { deleted: [], errors: [] };
    }

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    const response = await this.client.send(command);

    return {
      deleted: response.Deleted?.map((d) => d.Key || '') || [],
      errors: response.Errors?.map((e) => e.Key || '') || [],
    };
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      const err = error as { name?: string };
      if (err.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async getSignedDownloadUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentType: options.contentType,
      ResponseContentDisposition: options.contentDisposition,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn || 3600,
    });
  }

  async getSignedUploadUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: options.contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn || 3600,
    });
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: options.prefix,
      MaxKeys: options.maxKeys || 1000,
      ContinuationToken: options.continuationToken,
    });

    const response = await this.client.send(command);

    return {
      objects:
        response.Contents?.map((obj) => ({
          key: obj.Key || '',
          size: obj.Size || 0,
          lastModified: obj.LastModified || new Date(),
          etag: obj.ETag?.replace(/"/g, ''),
        })) || [],
      isTruncated: response.IsTruncated || false,
      nextContinuationToken: response.NextContinuationToken,
    };
  }

  async getMetadata(key: string): Promise<{
    size: number;
    contentType: string;
    lastModified: Date;
    etag?: string;
    metadata?: Record<string, string>;
  } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified || new Date(),
        etag: response.ETag?.replace(/"/g, ''),
        metadata: response.Metadata,
      };
    } catch (error) {
      const err = error as { name?: string };
      if (err.name === 'NotFound') {
        return null;
      }
      throw error;
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<boolean> {
    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourceKey}`,
      Key: destinationKey,
    });

    await this.client.send(command);
    return true;
  }

  async testConnection(): Promise<{ success: boolean; message?: string }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1,
      });

      await this.client.send(command);
      return { success: true };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || 'Connection failed',
      };
    }
  }

  private getObjectUrl(key: string): string {
    // Return a basic URL structure
    // This may not be the actual public URL depending on bucket configuration
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}

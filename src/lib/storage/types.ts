export type StorageProvider = 's3' | 'r2' | 'gcs' | 'b2' | 'minio' | 'local';

export interface StorageConfig {
  id: string;
  provider: StorageProvider;
  bucket: string;
  region?: string;
  endpoint?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  isActive: boolean;
}

export interface UploadOptions {
  contentType?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  acl?: 'private' | 'public-read';
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
  etag?: string;
}

export interface DownloadResult {
  body: Buffer | ReadableStream;
  contentType: string;
  contentLength: number;
  lastModified?: Date;
  etag?: string;
}

export interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 3600 (1 hour)
  contentType?: string;
  contentDisposition?: string;
}

export interface ListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ListResult {
  objects: {
    key: string;
    size: number;
    lastModified: Date;
    etag?: string;
  }[];
  isTruncated: boolean;
  nextContinuationToken?: string;
}

export interface StorageProviderInterface {
  /**
   * Upload a file to storage
   */
  upload(
    key: string,
    body: Buffer | ReadableStream<Uint8Array>,
    options?: UploadOptions
  ): Promise<UploadResult>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<DownloadResult>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<boolean>;

  /**
   * Delete multiple files from storage
   */
  deleteMany(keys: string[]): Promise<{ deleted: string[]; errors: string[] }>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get a signed URL for downloading a file
   */
  getSignedDownloadUrl(key: string, options?: SignedUrlOptions): Promise<string>;

  /**
   * Get a signed URL for uploading a file
   */
  getSignedUploadUrl(key: string, options?: SignedUrlOptions): Promise<string>;

  /**
   * List objects in storage
   */
  list(options?: ListOptions): Promise<ListResult>;

  /**
   * Get file metadata
   */
  getMetadata(key: string): Promise<{
    size: number;
    contentType: string;
    lastModified: Date;
    etag?: string;
    metadata?: Record<string, string>;
  } | null>;

  /**
   * Copy a file within storage
   */
  copy(sourceKey: string, destinationKey: string): Promise<boolean>;

  /**
   * Test connection to storage
   */
  testConnection(): Promise<{ success: boolean; message?: string }>;
}

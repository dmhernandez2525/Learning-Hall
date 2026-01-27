import crypto from 'crypto';
import { getPayloadClient } from '@/lib/payload';
import type { StorageConfig, StorageProviderInterface } from './types';
import { S3Provider } from './providers/s3';
import { LocalProvider } from './providers/local';

export * from './types';

// Cache for storage providers to avoid recreating them
const providerCache = new Map<string, StorageProviderInterface>();

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get the encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.STORAGE_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('STORAGE_ENCRYPTION_KEY environment variable must be set');
  }
  // Key should be 32 bytes (64 hex characters) for AES-256
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  // If not hex, hash the key to get 32 bytes
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt credentials using AES-256-GCM
 * Returns: base64(iv + authTag + ciphertext)
 */
export function encryptCredentials(credentials: {
  accessKeyId: string;
  secretAccessKey: string;
}): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const plaintext = JSON.stringify(credentials);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine: IV (16) + AuthTag (16) + Ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt credentials using AES-256-GCM
 */
function decryptCredentials(encryptedData: string): {
  accessKeyId: string;
  secretAccessKey: string;
} | undefined {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      console.error('Encrypted data too short');
      return undefined;
    }

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.error('Failed to decrypt credentials:', error);
    return undefined;
  }
}

/**
 * Create a storage provider instance based on configuration
 */
export function createProvider(config: StorageConfig): StorageProviderInterface {
  switch (config.provider) {
    case 's3':
    case 'r2':
    case 'b2':
    case 'minio':
      return new S3Provider(config);
    case 'local':
      return new LocalProvider(config);
    case 'gcs':
      // GCS can use S3-compatible interface with interoperability mode
      // For full GCS support, implement a separate GCSProvider
      throw new Error('GCS provider not yet implemented. Use S3 interoperability mode.');
    default:
      throw new Error(`Unknown storage provider: ${config.provider}`);
  }
}

/**
 * Get storage configuration by ID
 */
export async function getStorageConfig(configId: string): Promise<StorageConfig | null> {
  const payload = await getPayloadClient();

  try {
    const result = await payload.findByID({
      collection: 'storage-configs',
      id: configId,
    });

    if (!result) return null;

    const doc = result as Record<string, unknown>;

    return {
      id: String(doc.id),
      provider: doc.provider as StorageConfig['provider'],
      bucket: String(doc.bucket),
      region: doc.region ? String(doc.region) : undefined,
      endpoint: doc.endpoint ? String(doc.endpoint) : undefined,
      credentials: doc.credentialsEncrypted
        ? decryptCredentials(String(doc.credentialsEncrypted))
        : undefined,
      isActive: Boolean(doc.isActive),
    };
  } catch {
    return null;
  }
}

/**
 * Get active storage configuration for a tenant
 */
export async function getActiveStorageConfig(tenantId: string): Promise<StorageConfig | null> {
  const payload = await getPayloadClient();

  try {
    const result = await payload.find({
      collection: 'storage-configs',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { isActive: { equals: true } },
        ],
      },
      limit: 1,
    });

    if (result.docs.length === 0) return null;

    const doc = result.docs[0] as Record<string, unknown>;

    return {
      id: String(doc.id),
      provider: doc.provider as StorageConfig['provider'],
      bucket: String(doc.bucket),
      region: doc.region ? String(doc.region) : undefined,
      endpoint: doc.endpoint ? String(doc.endpoint) : undefined,
      credentials: doc.credentialsEncrypted
        ? decryptCredentials(String(doc.credentialsEncrypted))
        : undefined,
      isActive: Boolean(doc.isActive),
    };
  } catch {
    return null;
  }
}

/**
 * Get a storage provider instance for a configuration ID
 * Uses caching to reuse provider instances
 */
export async function getStorageProvider(configId: string): Promise<StorageProviderInterface> {
  // Check cache first
  const cached = providerCache.get(configId);
  if (cached) return cached;

  // Load configuration
  const config = await getStorageConfig(configId);
  if (!config) {
    throw new Error(`Storage configuration not found: ${configId}`);
  }

  if (!config.isActive) {
    throw new Error(`Storage configuration is not active: ${configId}`);
  }

  // Create provider and cache it
  const provider = createProvider(config);
  providerCache.set(configId, provider);

  return provider;
}

/**
 * Get a storage provider instance for a tenant
 * Uses the tenant's active storage configuration
 */
export async function getStorageProviderForTenant(
  tenantId: string
): Promise<StorageProviderInterface> {
  const config = await getActiveStorageConfig(tenantId);

  if (!config) {
    throw new Error(`No active storage configuration for tenant: ${tenantId}`);
  }

  // Check cache
  const cached = providerCache.get(config.id);
  if (cached) return cached;

  // Create provider and cache it
  const provider = createProvider(config);
  providerCache.set(config.id, provider);

  return provider;
}

/**
 * Get a default storage provider for development
 * Uses environment variables or falls back to local storage
 */
export function getDefaultStorageProvider(): StorageProviderInterface {
  const cacheKey = 'default';
  const cached = providerCache.get(cacheKey);
  if (cached) return cached;

  // Check for environment-based configuration
  const provider = process.env.STORAGE_PROVIDER as StorageConfig['provider'] | undefined;
  const bucket = process.env.STORAGE_BUCKET || 'default';

  const config: StorageConfig = {
    id: 'default',
    provider: provider || 'local',
    bucket,
    region: process.env.STORAGE_REGION || process.env.AWS_REGION,
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials:
      process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
            secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
          }
        : undefined,
    isActive: true,
  };

  const storageProvider = createProvider(config);
  providerCache.set(cacheKey, storageProvider);

  return storageProvider;
}

/**
 * Clear the provider cache
 * Call this if storage configurations are updated
 */
export function clearProviderCache(): void {
  providerCache.clear();
}

/**
 * Remove a specific provider from cache
 */
export function invalidateProvider(configId: string): void {
  providerCache.delete(configId);
}

/**
 * Test storage configuration connection
 */
export async function testStorageConfig(
  configId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const provider = await getStorageProvider(configId);
    return await provider.testConnection();
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * List all storage configurations for a tenant
 */
export async function listStorageConfigs(tenantId: string): Promise<StorageConfig[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'storage-configs',
    where: {
      tenant: { equals: tenantId },
    },
    sort: '-updatedAt',
  });

  return result.docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d.id),
      provider: d.provider as StorageConfig['provider'],
      bucket: String(d.bucket),
      region: d.region ? String(d.region) : undefined,
      endpoint: d.endpoint ? String(d.endpoint) : undefined,
      // Don't expose credentials in list response
      isActive: Boolean(d.isActive),
    };
  });
}

// Multi-layer Caching System
import { createHash } from 'crypto';

// Cache configuration
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  staleWhileRevalidate?: boolean;
}

// Cache entry
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  isStale?: boolean;
}

// Default cache configurations
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_SIZE = 5000;

// Simple LRU-like cache using Map (maintains insertion order)
class SimpleCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(options: { max: number }) {
    this.maxSize = options.max;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Delete first to update position
    this.cache.delete(key);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  get size(): number {
    return this.cache.size;
  }

  get max(): number {
    return this.maxSize;
  }
}

// In-memory cache using simple LRU implementation
const memoryCache = new SimpleCache<string, CacheEntry<unknown>>({
  max: DEFAULT_MAX_SIZE,
});

// Cache namespaces for different data types
export const CacheNamespaces = {
  COURSES: 'courses',
  USERS: 'users',
  ENROLLMENTS: 'enrollments',
  PROGRESS: 'progress',
  SEARCH: 'search',
  RECOMMENDATIONS: 'recommendations',
  ANALYTICS: 'analytics',
  TEMPLATES: 'templates',
  SESSIONS: 'sessions',
} as const;

type CacheNamespace = (typeof CacheNamespaces)[keyof typeof CacheNamespaces];

// Build cache key
function buildKey(namespace: CacheNamespace, key: string): string {
  return `${namespace}:${key}`;
}

// Get from cache
export async function cacheGet<T>(
  namespace: CacheNamespace,
  key: string
): Promise<T | undefined> {
  const cacheKey = buildKey(namespace, key);

  // Check memory cache first
  const entry = memoryCache.get(cacheKey) as CacheEntry<T> | undefined;

  if (entry) {
    const now = Date.now();
    if (now < entry.expiresAt) {
      return entry.value;
    }
    // Entry is expired, remove it
    memoryCache.delete(cacheKey);
  }

  // If Redis is configured, check there
  if (process.env.REDIS_URL) {
    try {
      const { getRedisClient } = await import('./redis');
      const redis = await getRedisClient();
      const data = await redis.get(cacheKey);
      if (data) {
        const parsed = JSON.parse(data) as T;
        // Store in memory cache for faster subsequent access
        memoryCache.set(cacheKey, {
          value: parsed,
          expiresAt: Date.now() + DEFAULT_TTL,
        });
        return parsed;
      }
    } catch (error) {
      console.error('Redis cache get error:', error);
    }
  }

  return undefined;
}

// Set in cache
export async function cacheSet<T>(
  namespace: CacheNamespace,
  key: string,
  value: T,
  config: CacheConfig = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL } = config;
  const cacheKey = buildKey(namespace, key);
  const expiresAt = Date.now() + ttl;

  // Set in memory cache
  memoryCache.set(cacheKey, {
    value,
    expiresAt,
  });

  // If Redis is configured, also set there
  if (process.env.REDIS_URL) {
    try {
      const { getRedisClient } = await import('./redis');
      const redis = await getRedisClient();
      await redis.setex(cacheKey, Math.ceil(ttl / 1000), JSON.stringify(value));
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }
}

// Delete from cache
export async function cacheDelete(
  namespace: CacheNamespace,
  key: string
): Promise<void> {
  const cacheKey = buildKey(namespace, key);

  memoryCache.delete(cacheKey);

  if (process.env.REDIS_URL) {
    try {
      const { getRedisClient } = await import('./redis');
      const redis = await getRedisClient();
      await redis.del(cacheKey);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }
}

// Clear namespace
export async function cacheClearNamespace(namespace: CacheNamespace): Promise<void> {
  // Clear from memory cache
  const prefix = `${namespace}:`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  // Clear from Redis if configured
  if (process.env.REDIS_URL) {
    try {
      const { getRedisClient } = await import('./redis');
      const redis = await getRedisClient();
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }
}

// Cache wrapper with automatic caching
export async function withCache<T>(
  namespace: CacheNamespace,
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const { staleWhileRevalidate = false } = config;

  // Try to get from cache
  const cached = await cacheGet<T>(namespace, key);

  if (cached !== undefined) {
    // If stale-while-revalidate, refresh in background
    if (staleWhileRevalidate) {
      // Don't await, let it run in background
      fetcher()
        .then((fresh) => cacheSet(namespace, key, fresh, config))
        .catch(console.error);
    }
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Store in cache
  await cacheSet(namespace, key, fresh, config);

  return fresh;
}

// Memoization decorator for class methods
export function Cached(
  namespace: CacheNamespace,
  config: CacheConfig = {}
): MethodDecorator {
  return function (
    _target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = `${String(propertyKey)}:${JSON.stringify(args)}`;

      return withCache(
        namespace,
        key,
        () => originalMethod.apply(this, args),
        config
      );
    };

    return descriptor;
  };
}

// Cache statistics
export function getCacheStats(): {
  memorySize: number;
  memoryMaxSize: number;
  hitRate: number;
} {
  return {
    memorySize: memoryCache.size,
    memoryMaxSize: memoryCache.max,
    hitRate: 0, // Would need to track hits/misses
  };
}

// Course-specific cache helpers
export const courseCache = {
  async get(courseId: string) {
    return cacheGet(CacheNamespaces.COURSES, courseId);
  },

  async set(courseId: string, data: unknown, ttl?: number) {
    return cacheSet(CacheNamespaces.COURSES, courseId, data, { ttl });
  },

  async invalidate(courseId: string) {
    return cacheDelete(CacheNamespaces.COURSES, courseId);
  },

  async invalidateAll() {
    return cacheClearNamespace(CacheNamespaces.COURSES);
  },
};

// User-specific cache helpers
export const userCache = {
  async get(userId: string) {
    return cacheGet(CacheNamespaces.USERS, userId);
  },

  async set(userId: string, data: unknown, ttl?: number) {
    return cacheSet(CacheNamespaces.USERS, userId, data, { ttl });
  },

  async invalidate(userId: string) {
    return cacheDelete(CacheNamespaces.USERS, userId);
  },

  async invalidateAll() {
    return cacheClearNamespace(CacheNamespaces.USERS);
  },
};

// Search cache helpers
export const searchCache = {
  async get(queryHash: string) {
    return cacheGet(CacheNamespaces.SEARCH, queryHash);
  },

  async set(queryHash: string, data: unknown, ttl: number = 60000) {
    return cacheSet(CacheNamespaces.SEARCH, queryHash, data, { ttl });
  },

  async invalidate(queryHash: string) {
    return cacheDelete(CacheNamespaces.SEARCH, queryHash);
  },

  async invalidateAll() {
    return cacheClearNamespace(CacheNamespaces.SEARCH);
  },

  // Generate hash for search query using SHA-256
  hashQuery(query: string, filters: Record<string, unknown>): string {
    const normalized = JSON.stringify({ query: query.toLowerCase(), filters });
    return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  },
};

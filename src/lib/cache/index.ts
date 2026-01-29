/**
 * Caching layer for Learning Hall
 *
 * Supports Redis (recommended for production) and in-memory caching (development)
 */

import { createClient, RedisClientType } from 'redis';

export type CacheConfig = {
  type: 'redis' | 'memory';
  redis?: {
    url: string;
    password?: string;
    tls?: boolean;
  };
  defaultTTL?: number; // seconds
  prefix?: string;
};

// In-memory cache for development/fallback
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

let redisClient: RedisClientType | null = null;
let cacheConfig: CacheConfig = {
  type: 'memory',
  defaultTTL: 300, // 5 minutes
  prefix: 'lh:',
};

/**
 * Initialize the cache
 */
export async function initCache(config?: Partial<CacheConfig>) {
  cacheConfig = { ...cacheConfig, ...config };

  if (cacheConfig.type === 'redis' && cacheConfig.redis?.url) {
    try {
      redisClient = createClient({
        url: cacheConfig.redis.url,
        password: cacheConfig.redis.password,
      });

      redisClient.on('error', (err) => {
        console.error('Redis error:', err);
        // Fallback to memory cache on error
        redisClient = null;
      });

      await redisClient.connect();
      console.log('Redis cache connected');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      redisClient = null;
    }
  }
}

/**
 * Get prefixed key
 */
function getKey(key: string): string {
  return `${cacheConfig.prefix}${key}`;
}

/**
 * Get a value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  const prefixedKey = getKey(key);

  if (redisClient) {
    try {
      const value = await redisClient.get(prefixedKey);
      if (value) {
        return JSON.parse(value) as T;
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }
  } else {
    // Memory cache
    const entry = memoryCache.get(prefixedKey);
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        return JSON.parse(entry.value) as T;
      }
      memoryCache.delete(prefixedKey);
    }
  }

  return null;
}

/**
 * Set a value in cache
 */
export async function set<T>(key: string, value: T, ttl?: number): Promise<void> {
  const prefixedKey = getKey(key);
  const ttlSeconds = ttl ?? cacheConfig.defaultTTL ?? 300;
  const stringValue = JSON.stringify(value);

  if (redisClient) {
    try {
      await redisClient.setEx(prefixedKey, ttlSeconds, stringValue);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  } else {
    // Memory cache
    memoryCache.set(prefixedKey, {
      value: stringValue,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

/**
 * Delete a value from cache
 */
export async function del(key: string): Promise<void> {
  const prefixedKey = getKey(key);

  if (redisClient) {
    try {
      await redisClient.del(prefixedKey);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  } else {
    memoryCache.delete(prefixedKey);
  }
}

/**
 * Delete multiple values by pattern
 */
export async function delPattern(pattern: string): Promise<void> {
  const prefixedPattern = getKey(pattern);

  if (redisClient) {
    try {
      const keys = await redisClient.keys(prefixedPattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache delPattern error:', error);
    }
  } else {
    // Memory cache - convert glob pattern to regex
    const regex = new RegExp(`^${prefixedPattern.replace(/\*/g, '.*')}$`);
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  }
}

/**
 * Check if a key exists
 */
export async function exists(key: string): Promise<boolean> {
  const prefixedKey = getKey(key);

  if (redisClient) {
    try {
      return (await redisClient.exists(prefixedKey)) === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  } else {
    const entry = memoryCache.get(prefixedKey);
    if (entry && entry.expiresAt > Date.now()) {
      return true;
    }
    return false;
  }
}

/**
 * Get or set a value using a callback
 */
export async function remember<T>(
  key: string,
  callback: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = await get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await callback();
  await set(key, value, ttl);
  return value;
}

/**
 * Increment a counter
 */
export async function incr(key: string): Promise<number> {
  const prefixedKey = getKey(key);

  if (redisClient) {
    try {
      return await redisClient.incr(prefixedKey);
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  } else {
    const entry = memoryCache.get(prefixedKey);
    let value = 1;
    if (entry) {
      value = parseInt(entry.value || '0') + 1;
    }
    memoryCache.set(prefixedKey, {
      value: String(value),
      expiresAt: Date.now() + (cacheConfig.defaultTTL ?? 300) * 1000,
    });
    return value;
  }
}

/**
 * Get time to live for a key
 */
export async function ttl(key: string): Promise<number> {
  const prefixedKey = getKey(key);

  if (redisClient) {
    try {
      return await redisClient.ttl(prefixedKey);
    } catch (error) {
      console.error('Cache ttl error:', error);
      return -1;
    }
  } else {
    const entry = memoryCache.get(prefixedKey);
    if (entry) {
      return Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
    }
    return -2;
  }
}

/**
 * Clear all cache
 */
export async function flush(): Promise<void> {
  if (redisClient) {
    try {
      const keys = await redisClient.keys(`${cacheConfig.prefix}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  } else {
    memoryCache.clear();
  }
}

/**
 * Close the cache connection
 */
export async function close(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache key generators for common patterns
export const cacheKeys = {
  course: (id: string) => `course:${id}`,
  courseBySlug: (slug: string) => `course:slug:${slug}`,
  courseList: (tenantId: string, page = 1) => `courses:${tenantId}:${page}`,
  lesson: (id: string) => `lesson:${id}`,
  userProgress: (userId: string, courseId: string) => `progress:${userId}:${courseId}`,
  userEnrollments: (userId: string) => `enrollments:${userId}`,
  searchResults: (query: string, filters: string) => `search:${query}:${filters}`,
  leaderboard: (tenantId: string, period: string) => `leaderboard:${tenantId}:${period}`,
  analytics: (type: string, id: string, period: string) => `analytics:${type}:${id}:${period}`,
};

// Cache invalidation helpers
export const invalidate = {
  course: async (courseId: string) => {
    await del(cacheKeys.course(courseId));
    await delPattern('course:slug:*');
    await delPattern('courses:*');
    await delPattern(`search:*`);
  },
  lesson: async (lessonId: string) => {
    await del(cacheKeys.lesson(lessonId));
  },
  userProgress: async (userId: string, courseId?: string) => {
    if (courseId) {
      await del(cacheKeys.userProgress(userId, courseId));
    } else {
      await delPattern(`progress:${userId}:*`);
    }
  },
  userEnrollments: async (userId: string) => {
    await del(cacheKeys.userEnrollments(userId));
  },
  leaderboard: async (tenantId: string) => {
    await delPattern(`leaderboard:${tenantId}:*`);
  },
  analytics: async (type: string, id: string) => {
    await delPattern(`analytics:${type}:${id}:*`);
  },
};

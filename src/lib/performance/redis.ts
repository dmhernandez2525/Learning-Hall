// Redis Client with Connection Pooling
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

let redisClient: Redis | null = null;
let isConnecting = false;
const connectionPromise: Promise<Redis>[] = [];

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 10) {
      console.error('Redis connection failed after 10 retries');
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000); // Exponential backoff
  },
  lazyConnect: true,
  enableReadyCheck: true,
  connectTimeout: 10000,
};

// Get or create Redis client
export async function getRedisClient(): Promise<Redis> {
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  // If already connecting, wait for that promise
  if (isConnecting && connectionPromise.length > 0) {
    return connectionPromise[0];
  }

  isConnecting = true;

  const promise = new Promise<Redis>((resolve, reject) => {
    try {
      // Use URL if provided, otherwise use config
      const client = process.env.REDIS_URL
        ? new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          })
        : new Redis(redisConfig);

      client.on('error', (err) => {
        console.error('Redis client error:', err);
      });

      client.on('connect', () => {
        console.log('Redis client connected');
      });

      client.on('ready', () => {
        console.log('Redis client ready');
        redisClient = client;
        isConnecting = false;
        resolve(client);
      });

      client.on('close', () => {
        console.log('Redis client connection closed');
        redisClient = null;
      });

      // Connect
      client.connect().catch(reject);
    } catch (error) {
      isConnecting = false;
      reject(error);
    }
  });

  connectionPromise[0] = promise;
  return promise;
}

// Close Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Check if Redis is available
export async function isRedisAvailable(): Promise<boolean> {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    return false;
  }

  try {
    const client = await getRedisClient();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

// Redis pub/sub for distributed cache invalidation
export async function publishCacheInvalidation(
  channel: string,
  message: string
): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.publish(`cache:invalidate:${channel}`, message);
  } catch (error) {
    console.error('Failed to publish cache invalidation:', error);
  }
}

// Subscribe to cache invalidation events
export async function subscribeToCacheInvalidation(
  channel: string,
  handler: (message: string) => void
): Promise<() => void> {
  try {
    // Use a separate client for subscriptions
    const client = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL)
      : new Redis(redisConfig);

    await client.subscribe(`cache:invalidate:${channel}`);

    client.on('message', (_ch, message) => {
      handler(message);
    });

    // Return unsubscribe function
    return () => {
      client.unsubscribe(`cache:invalidate:${channel}`);
      client.quit();
    };
  } catch (error) {
    console.error('Failed to subscribe to cache invalidation:', error);
    return () => {};
  }
}

// Distributed lock using Redis
export async function acquireLock(
  lockKey: string,
  ttlMs: number = 30000
): Promise<string | null> {
  try {
    const client = await getRedisClient();
    // Use cryptographically secure random UUID for lock value
    const lockValue = randomUUID();

    // SET with NX (only set if not exists) and PX (expiry in ms)
    const result = await client.set(
      `lock:${lockKey}`,
      lockValue,
      'PX',
      ttlMs,
      'NX'
    );

    return result === 'OK' ? lockValue : null;
  } catch (error) {
    console.error('Failed to acquire lock:', error);
    return null;
  }
}

// Release distributed lock
export async function releaseLock(
  lockKey: string,
  lockValue: string
): Promise<boolean> {
  try {
    const client = await getRedisClient();

    // Only delete if we own the lock (using Lua script for atomicity)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await client.eval(script, 1, `lock:${lockKey}`, lockValue);
    return result === 1;
  } catch (error) {
    console.error('Failed to release lock:', error);
    return false;
  }
}

// Rate limiting using Redis
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const client = await getRedisClient();
    const now = Date.now();
    const windowStart = now - windowMs;

    const redisKey = `ratelimit:${key}`;

    // Use sorted set with timestamps as scores
    const pipeline = client.pipeline();

    // Remove old entries
    pipeline.zremrangebyscore(redisKey, '-inf', windowStart);

    // Count current entries
    pipeline.zcard(redisKey);

    // Add current request
    pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

    // Set expiry
    pipeline.pexpire(redisKey, windowMs);

    const results = await pipeline.exec();

    // Get count from zcard result
    const count = (results?.[1]?.[1] as number) || 0;
    const allowed = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const resetAt = now + windowMs;

    return { allowed, remaining, resetAt };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if Redis is unavailable
    return { allowed: true, remaining: limit, resetAt: Date.now() };
  }
}

// Session storage using Redis
export const sessionStore = {
  async get(sessionId: string): Promise<Record<string, unknown> | null> {
    try {
      const client = await getRedisClient();
      const data = await client.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  },

  async set(
    sessionId: string,
    data: Record<string, unknown>,
    ttlMs: number = 24 * 60 * 60 * 1000
  ): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.setex(
        `session:${sessionId}`,
        Math.ceil(ttlMs / 1000),
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Session set error:', error);
    }
  },

  async delete(sessionId: string): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Session delete error:', error);
    }
  },

  async touch(sessionId: string, ttlMs: number): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.pexpire(`session:${sessionId}`, ttlMs);
    } catch (error) {
      console.error('Session touch error:', error);
    }
  },
};

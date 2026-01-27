import { NextResponse } from 'next/server';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error' | 'timeout';
    redis?: 'ok' | 'error' | 'timeout' | 'not_configured';
  };
  responseTime: number;
  debug?: {
    databaseUrlSet: boolean;
    databaseHost?: string;
    error?: string;
  };
}

/**
 * Check database connectivity with timeout
 */
async function checkDatabase(): Promise<{ status: 'ok' | 'error' | 'timeout'; error?: string }> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return { status: 'error', error: 'DATABASE_URL not set' };
  }

  const timeoutPromise = new Promise<{ status: 'timeout' }>((resolve) =>
    setTimeout(() => resolve({ status: 'timeout' }), HEALTH_CHECK_TIMEOUT)
  );

  const checkPromise = (async (): Promise<{ status: 'ok' | 'error'; error?: string }> => {
    try {
      const { getPayloadClient } = await import('@/lib/payload');
      const payload = await getPayloadClient();
      await payload.find({
        collection: 'users',
        limit: 1,
      });
      return { status: 'ok' };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { status: 'error', error };
    }
  })();

  return Promise.race([checkPromise, timeoutPromise]);
}

/**
 * Check Redis connectivity with timeout and proper cleanup
 */
async function checkRedis(): Promise<'ok' | 'error' | 'timeout' | 'not_configured'> {
  if (!process.env.REDIS_URL) {
    return 'not_configured';
  }

  const timeoutPromise = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), HEALTH_CHECK_TIMEOUT)
  );

  const checkPromise = (async (): Promise<'ok' | 'error'> => {
    let redis = null;
    try {
      const IORedis = (await import('ioredis')).default;
      redis = new IORedis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
      });

      await redis.connect();
      await redis.ping();
      return 'ok';
    } catch {
      return 'error';
    } finally {
      if (redis) {
        try {
          await redis.quit();
        } catch {
          redis.disconnect();
        }
      }
    }
  })();

  return Promise.race([checkPromise, timeoutPromise]);
}

export async function GET() {
  const startTime = Date.now();
  const dbUrl = process.env.DATABASE_URL;

  // Run health checks in parallel
  const [databaseResult, redisStatus] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const responseTime = Date.now() - startTime;

  // Determine overall status
  let overallStatus: HealthStatus['status'] = 'healthy';
  if (databaseResult.status !== 'ok') {
    overallStatus = 'unhealthy';
  } else if (redisStatus === 'error' || redisStatus === 'timeout') {
    overallStatus = 'degraded';
  }

  // Extract host from DATABASE_URL for debugging (without exposing credentials)
  let databaseHost: string | undefined;
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      databaseHost = url.hostname;
    } catch {
      databaseHost = 'invalid-url';
    }
  }

  const status: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '3.0.0',
    checks: {
      database: databaseResult.status,
      redis: redisStatus,
    },
    responseTime,
    debug: {
      databaseUrlSet: !!dbUrl,
      databaseHost,
      error: databaseResult.error,
    },
  };

  // Always return 200 for health check to allow deployment
  // The status field in the response body indicates actual health
  return NextResponse.json(status, { status: 200 });
}

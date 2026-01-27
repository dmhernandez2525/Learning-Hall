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
}

/**
 * Check database connectivity with timeout
 */
async function checkDatabase(): Promise<'ok' | 'error' | 'timeout'> {
  const timeoutPromise = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), HEALTH_CHECK_TIMEOUT)
  );

  const checkPromise = (async (): Promise<'ok' | 'error'> => {
    try {
      const { getPayloadClient } = await import('@/lib/payload');
      const payload = await getPayloadClient();
      await payload.find({
        collection: 'users',
        limit: 1,
      });
      return 'ok';
    } catch {
      return 'error';
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
      // Always clean up the connection
      if (redis) {
        try {
          await redis.quit();
        } catch {
          // Force disconnect if quit fails
          redis.disconnect();
        }
      }
    }
  })();

  return Promise.race([checkPromise, timeoutPromise]);
}

export async function GET() {
  const startTime = Date.now();

  // Run health checks in parallel
  const [databaseStatus, redisStatus] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);

  const responseTime = Date.now() - startTime;

  // Determine overall status
  let overallStatus: HealthStatus['status'] = 'healthy';
  if (databaseStatus !== 'ok') {
    overallStatus = 'unhealthy';
  } else if (redisStatus === 'error' || redisStatus === 'timeout') {
    overallStatus = 'degraded';
  }

  const status: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '3.0.0',
    checks: {
      database: databaseStatus,
      redis: redisStatus,
    },
    responseTime,
  };

  // Return 503 if unhealthy, 200 otherwise
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;
  return NextResponse.json(status, { status: httpStatus });
}

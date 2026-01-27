import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
    redis?: 'ok' | 'error' | 'not_configured';
  };
}

export async function GET() {
  const status: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '3.0.0',
    checks: {
      database: 'ok',
    },
  };

  // Check database connectivity
  try {
    // Use dynamic import to avoid loading Payload on every health check
    const { getPayloadClient } = await import('@/lib/payload');
    const payload = await getPayloadClient();
    await payload.find({
      collection: 'users',
      limit: 1,
    });
  } catch {
    status.checks.database = 'error';
    status.status = 'unhealthy';
  }

  // Check Redis if configured
  if (process.env.REDIS_URL) {
    try {
      const IORedis = (await import('ioredis')).default;
      const redis = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
      });
      await redis.ping();
      await redis.quit();
      status.checks.redis = 'ok';
    } catch {
      status.checks.redis = 'error';
      if (status.status === 'healthy') {
        status.status = 'degraded';
      }
    }
  } else {
    status.checks.redis = 'not_configured';
  }

  const httpStatus = status.status === 'unhealthy' ? 503 : 200;
  return NextResponse.json(status, { status: httpStatus });
}

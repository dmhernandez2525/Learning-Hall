// Performance Monitoring & Metrics
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  userId?: string;
  tenantId?: string;
  userAgent?: string;
}

export interface ErrorMetric {
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  userId?: string;
  timestamp: number;
}

// In-memory metrics storage (replace with proper metrics backend in production)
class MetricsCollector {
  private requestMetrics: RequestMetrics[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private customMetrics: Map<string, PerformanceMetric[]> = new Map();
  private maxStoredMetrics: number = 10000;

  // Record a request
  recordRequest(metrics: RequestMetrics): void {
    this.requestMetrics.push(metrics);

    // Cleanup old metrics
    if (this.requestMetrics.length > this.maxStoredMetrics) {
      this.requestMetrics = this.requestMetrics.slice(-Math.floor(this.maxStoredMetrics / 2));
    }
  }

  // Record an error
  recordError(error: Error, context?: Partial<ErrorMetric>): void {
    this.errorMetrics.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      ...context,
    });

    // Cleanup old errors
    if (this.errorMetrics.length > this.maxStoredMetrics) {
      this.errorMetrics = this.errorMetrics.slice(-Math.floor(this.maxStoredMetrics / 2));
    }
  }

  // Record a custom metric
  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    if (!this.customMetrics.has(name)) {
      this.customMetrics.set(name, []);
    }

    const metrics = this.customMetrics.get(name)!;
    metrics.push(metric);

    // Cleanup
    if (metrics.length > 1000) {
      this.customMetrics.set(name, metrics.slice(-500));
    }
  }

  // Get request statistics
  getRequestStats(timeWindowMs: number = 60000): {
    totalRequests: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    errorRate: number;
    requestsPerSecond: number;
    statusCodes: Record<string, number>;
    slowestEndpoints: { path: string; avgDuration: number }[];
  } {
    const cutoff = Date.now() - timeWindowMs;
    const recentRequests = this.requestMetrics.filter((r) => r.timestamp > cutoff);

    if (recentRequests.length === 0) {
      return {
        totalRequests: 0,
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorRate: 0,
        requestsPerSecond: 0,
        statusCodes: {},
        slowestEndpoints: [],
      };
    }

    // Calculate durations
    const durations = recentRequests.map((r) => r.duration).sort((a, b) => a - b);
    const totalDuration = durations.reduce((a, b) => a + b, 0);

    // Calculate percentiles
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    // Calculate error rate
    const errors = recentRequests.filter((r) => r.statusCode >= 400).length;

    // Count status codes
    const statusCodes: Record<string, number> = {};
    for (const req of recentRequests) {
      const code = String(req.statusCode);
      statusCodes[code] = (statusCodes[code] || 0) + 1;
    }

    // Find slowest endpoints
    const endpointDurations: Record<string, { total: number; count: number }> = {};
    for (const req of recentRequests) {
      if (!endpointDurations[req.path]) {
        endpointDurations[req.path] = { total: 0, count: 0 };
      }
      endpointDurations[req.path].total += req.duration;
      endpointDurations[req.path].count++;
    }

    const slowestEndpoints = Object.entries(endpointDurations)
      .map(([path, data]) => ({
        path,
        avgDuration: data.total / data.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      totalRequests: recentRequests.length,
      avgDuration: totalDuration / recentRequests.length,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      errorRate: (errors / recentRequests.length) * 100,
      requestsPerSecond: recentRequests.length / (timeWindowMs / 1000),
      statusCodes,
      slowestEndpoints,
    };
  }

  // Get error statistics
  getErrorStats(timeWindowMs: number = 60000): {
    totalErrors: number;
    topErrors: { message: string; count: number }[];
    errorsByPath: Record<string, number>;
  } {
    const cutoff = Date.now() - timeWindowMs;
    const recentErrors = this.errorMetrics.filter((e) => e.timestamp > cutoff);

    // Count error messages
    const errorCounts: Record<string, number> = {};
    const pathCounts: Record<string, number> = {};

    for (const error of recentErrors) {
      const key = error.message.substring(0, 100);
      errorCounts[key] = (errorCounts[key] || 0) + 1;

      if (error.path) {
        pathCounts[error.path] = (pathCounts[error.path] || 0) + 1;
      }
    }

    const topErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: recentErrors.length,
      topErrors,
      errorsByPath: pathCounts,
    };
  }

  // Get custom metric statistics
  getMetricStats(name: string, timeWindowMs: number = 60000): {
    count: number;
    avg: number;
    min: number;
    max: number;
    sum: number;
  } | null {
    const metrics = this.customMetrics.get(name);
    if (!metrics) return null;

    const cutoff = Date.now() - timeWindowMs;
    const recentMetrics = metrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, sum: 0 };
    }

    const values = recentMetrics.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum,
    };
  }

  // Clear all metrics
  clear(): void {
    this.requestMetrics = [];
    this.errorMetrics = [];
    this.customMetrics.clear();
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

export { metricsCollector };

// Request timing middleware helper
export function createRequestTimer() {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  return {
    end: (path: string, method: string, statusCode: number, context?: { userId?: string; tenantId?: string; userAgent?: string }) => {
      const duration = performance.now() - startTime;
      const endMemory = process.memoryUsage();

      metricsCollector.recordRequest({
        path,
        method,
        statusCode,
        duration,
        timestamp: Date.now(),
        ...context,
      });

      // Record memory usage
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      if (memoryDelta > 10 * 1024 * 1024) {
        // More than 10MB increase
        metricsCollector.recordMetric('high_memory_request', memoryDelta, 'bytes', { path });
      }

      return { duration, memoryDelta };
    },
  };
}

// Performance timing decorator
export function Timed(metricName?: string): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = metricName || `${(target as object).constructor.name}.${String(propertyKey)}`;

    descriptor.value = async function (...args: unknown[]) {
      const start = performance.now();

      try {
        return await originalMethod.apply(this, args);
      } finally {
        const duration = performance.now() - start;
        metricsCollector.recordMetric(name, duration, 'ms');
      }
    };

    return descriptor;
  };
}

// Health check types
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
    latency?: number;
  }[];
  uptime: number;
  timestamp: number;
}

// System health checker
export async function checkHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = [];

  // Check database
  try {
    const dbStart = performance.now();
    const { getPayload } = await import('payload');
    const config = (await import('@/payload.config')).default;
    const payload = await getPayload({ config });
    await payload.find({ collection: 'users', limit: 1 });
    const dbLatency = performance.now() - dbStart;

    checks.push({
      name: 'database',
      status: dbLatency < 500 ? 'pass' : 'warn',
      latency: dbLatency,
    });
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Database error',
    });
  }

  // Check Redis if configured
  if (process.env.REDIS_URL) {
    try {
      const redisStart = performance.now();
      const { isRedisAvailable } = await import('./redis');
      const available = await isRedisAvailable();
      const redisLatency = performance.now() - redisStart;

      checks.push({
        name: 'redis',
        status: available ? (redisLatency < 100 ? 'pass' : 'warn') : 'fail',
        latency: redisLatency,
        message: available ? undefined : 'Redis unavailable',
      });
    } catch (error) {
      checks.push({
        name: 'redis',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Redis error',
      });
    }
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
  const memoryPercent = (heapUsedMB / heapTotalMB) * 100;

  checks.push({
    name: 'memory',
    status: memoryPercent < 80 ? 'pass' : memoryPercent < 95 ? 'warn' : 'fail',
    message: `${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB (${memoryPercent.toFixed(1)}%)`,
  });

  // Determine overall status
  const hasFailure = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warn');

  return {
    status: hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
    checks,
    uptime: process.uptime(),
    timestamp: Date.now(),
  };
}

// Get system metrics
export function getSystemMetrics(): {
  memory: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  nodeVersion: string;
} {
  return {
    memory: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    uptime: process.uptime(),
    nodeVersion: process.version,
  };
}

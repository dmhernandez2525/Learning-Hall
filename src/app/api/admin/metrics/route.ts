import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  metricsCollector,
  getSystemMetrics,
  checkHealth,
} from '@/lib/performance/monitoring';
import { getCacheStats } from '@/lib/performance/cache';
import { jobQueue } from '@/lib/performance/background-jobs';

// GET /api/admin/metrics - Get system metrics (admin only)
// Note: System metrics are platform-wide and not tenant-scoped
// Only platform admins should have access to this endpoint
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    // Require admin role for system metrics
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    // Validate and bound timeWindow (1 second to 1 hour)
    const rawTimeWindow = parseInt(searchParams.get('timeWindow') || '60000', 10);
    const timeWindow = Math.min(Math.max(rawTimeWindow || 60000, 1000), 3600000);

    switch (type) {
      case 'requests':
        return NextResponse.json({
          requests: metricsCollector.getRequestStats(timeWindow),
        });

      case 'errors':
        return NextResponse.json({
          errors: metricsCollector.getErrorStats(timeWindow),
        });

      case 'system':
        return NextResponse.json({
          system: getSystemMetrics(),
        });

      case 'cache':
        return NextResponse.json({
          cache: getCacheStats(),
        });

      case 'jobs':
        return NextResponse.json({
          jobs: jobQueue.getStats(),
        });

      case 'health':
        const health = await checkHealth();
        return NextResponse.json({ health });

      case 'all':
      default:
        const [requestStats, errorStats, healthCheck] = await Promise.all([
          metricsCollector.getRequestStats(timeWindow),
          metricsCollector.getErrorStats(timeWindow),
          checkHealth(),
        ]);

        return NextResponse.json({
          requests: requestStats,
          errors: errorStats,
          system: getSystemMetrics(),
          cache: getCacheStats(),
          jobs: jobQueue.getStats(),
          health: healthCheck,
          timestamp: Date.now(),
        });
    }
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    );
  }
}

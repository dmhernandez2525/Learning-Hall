import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getCacheStats,
  cacheClearNamespace,
  CacheNamespaces,
} from '@/lib/performance/cache';

// GET /api/admin/cache - Get cache stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      stats: getCacheStats(),
      namespaces: Object.values(CacheNamespaces),
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cache - Clear cache (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { namespace } = body;

    if (namespace && !Object.values(CacheNamespaces).includes(namespace)) {
      return NextResponse.json(
        { error: 'Invalid namespace' },
        { status: 400 }
      );
    }

    if (namespace) {
      await cacheClearNamespace(namespace);
      return NextResponse.json({ cleared: namespace });
    }

    // Clear all namespaces
    for (const ns of Object.values(CacheNamespaces)) {
      await cacheClearNamespace(ns);
    }

    return NextResponse.json({ cleared: 'all' });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

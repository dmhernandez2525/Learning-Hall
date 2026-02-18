import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import {
  buildInstructorDashboardCsv,
  getInstructorDashboardData,
  getInstructorEnrollmentNotifications,
} from '@/lib/instructor-dashboard';

const querySchema = z.object({
  range: z.enum(['7d', '30d', '90d', '365d']).optional(),
  format: z.enum(['json', 'csv']).optional(),
  since: z.string().datetime().optional(),
  notificationsOnly: z.enum(['true', 'false']).optional(),
  instructorId: z.string().min(1).optional(),
});

function getCsvFilename(range: string): string {
  const dateToken = new Date().toISOString().slice(0, 10);
  return `instructor-dashboard-${range}-${dateToken}.csv`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const parsed = querySchema.safeParse({
      range: request.nextUrl.searchParams.get('range') || undefined,
      format: request.nextUrl.searchParams.get('format') || undefined,
      since: request.nextUrl.searchParams.get('since') || undefined,
      notificationsOnly: request.nextUrl.searchParams.get('notificationsOnly') || undefined,
      instructorId: request.nextUrl.searchParams.get('instructorId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const range = parsed.data.range ?? '30d';
    const format = parsed.data.format ?? 'json';
    const instructorId = parsed.data.instructorId ?? user.id;

    if (user.role !== 'admin' && instructorId !== user.id) {
      return NextResponse.json(
        { error: 'Cannot view another instructor dashboard' },
        { status: 403 }
      );
    }

    if (parsed.data.notificationsOnly === 'true') {
      if (format === 'csv') {
        return NextResponse.json(
          { error: 'CSV export is not supported for notifications-only requests' },
          { status: 400 }
        );
      }

      const notifications = await getInstructorEnrollmentNotifications({
        instructorId,
        since: parsed.data.since,
        limit: 20,
      });

      return NextResponse.json(notifications);
    }

    const dashboardData = await getInstructorDashboardData({
      instructorId,
      rangeKey: range,
      notificationsSince: parsed.data.since,
    });

    if (format === 'csv') {
      const csv = buildInstructorDashboardCsv(dashboardData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=\"${getCsvFilename(range)}\"`,
        },
      });
    }

    return NextResponse.json(dashboardData);
  } catch {
    return NextResponse.json({ error: 'Failed to load instructor dashboard' }, { status: 500 });
  }
}


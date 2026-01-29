import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const upcoming = searchParams.get('upcoming');
    const past = searchParams.get('past');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Build query conditions
    const where: Record<string, unknown> = {};

    // Only show published, scheduled, or live sessions publicly
    if (status) {
      where.status = { equals: status };
    } else {
      where.status = { in: ['published', 'scheduled', 'live'] };
    }

    // Filter by course
    if (courseId) {
      where.course = { equals: courseId };
    }

    // Filter for upcoming sessions
    const now = new Date().toISOString();
    if (upcoming === 'true') {
      where['scheduling.scheduledAt'] = { greater_than_equal: now };
    }

    // Filter for past sessions
    if (past === 'true') {
      where['scheduling.scheduledAt'] = { less_than: now };
    }

    const sessions = await payload.find({
      collection: 'live-sessions',
      where,
      limit,
      page,
      depth: 2,
      sort: upcoming === 'true' ? 'scheduling.scheduledAt' : '-scheduling.scheduledAt',
    });

    // Transform sessions for frontend
    const transformedSessions = sessions.docs.map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      course: session.course,
      host: session.host,
      coHosts: session.coHosts,
      status: session.status,
      scheduling: session.scheduling,
      platform: {
        provider: (session.platform as Record<string, unknown>)?.provider,
        joinUrl: (session.platform as Record<string, unknown>)?.joinUrl,
      },
      settings: {
        maxAttendees: (session.settings as Record<string, unknown>)?.maxAttendees,
        requiresEnrollment: (session.settings as Record<string, unknown>)?.requiresEnrollment,
        requiresRegistration: (session.settings as Record<string, unknown>)?.requiresRegistration,
        enableChat: (session.settings as Record<string, unknown>)?.enableChat,
        enableQA: (session.settings as Record<string, unknown>)?.enableQA,
      },
      recording: session.recording,
      stats: session.stats,
      image: session.image,
      tags: session.tags,
    }));

    return NextResponse.json({
      sessions: transformedSessions,
      totalDocs: sessions.totalDocs,
      totalPages: sessions.totalPages,
      page: sessions.page,
      hasNextPage: sessions.hasNextPage,
      hasPrevPage: sessions.hasPrevPage,
    });
  } catch (error) {
    console.error('Live sessions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'instructor'].includes(user.role || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });
    const body = await request.json();

    const session = await payload.create({
      collection: 'live-sessions',
      data: {
        ...body,
        host: user.id,
        status: 'draft',
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Live sessions POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create live session' },
      { status: 500 }
    );
  }
}

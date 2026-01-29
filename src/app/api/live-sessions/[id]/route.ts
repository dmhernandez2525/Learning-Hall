import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSession();
    const payload = await getPayload({ config });

    const session = await payload.findByID({
      collection: 'live-sessions',
      id,
      depth: 3,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user is registered (if logged in)
    let registration = null;
    if (user) {
      const attendanceRecords = await payload.find({
        collection: 'session-attendance',
        where: {
          session: { equals: id },
          user: { equals: user.id },
        },
        limit: 1,
      });
      registration = attendanceRecords.docs[0] || null;
    }

    // Get registration count
    const registrationCount = await payload.count({
      collection: 'session-attendance',
      where: {
        session: { equals: id },
      },
    });

    // Only expose sensitive URLs if user is host or registered
    const isHost = typeof session.host === 'object'
      ? session.host.id === user?.id
      : session.host === user?.id;
    const isCoHost = (session.coHosts as Array<{ id: string }> || []).some(
      (coHost) => (typeof coHost === 'object' ? coHost.id : coHost) === user?.id
    );
    const canAccess = isHost || isCoHost || registration;

    const response = {
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
        joinUrl: canAccess ? (session.platform as Record<string, unknown>)?.joinUrl : null,
        hostUrl: isHost ? (session.platform as Record<string, unknown>)?.hostUrl : null,
        embedCode: canAccess ? (session.platform as Record<string, unknown>)?.embedCode : null,
      },
      settings: session.settings,
      recording: session.status === 'ended' ? session.recording : null,
      materials: session.materials,
      stats: {
        registrations: registrationCount.totalDocs,
        attendees: (session.stats as Record<string, unknown>)?.attendees || 0,
        peakAttendees: (session.stats as Record<string, unknown>)?.peakAttendees || 0,
      },
      image: session.image,
      tags: session.tags,
      isRegistered: !!registration,
      isHost,
      isCoHost,
      registration,
    };

    return NextResponse.json({ session: response });
  } catch (error) {
    console.error('Live session GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });

    // Check if user is host or admin
    const existingSession = await payload.findByID({
      collection: 'live-sessions',
      id,
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const isHost = typeof existingSession.host === 'object'
      ? existingSession.host.id === user.id
      : existingSession.host === user.id;

    if (user.role !== 'admin' && !isHost) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updated = await payload.update({
      collection: 'live-sessions',
      id,
      data: body,
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error('Live session PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSession();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const payload = await getPayload({ config });

    await payload.delete({
      collection: 'live-sessions',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Live session DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

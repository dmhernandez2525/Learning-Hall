import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function POST(
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

    // Get the session
    const session = await payload.findByID({
      collection: 'live-sessions',
      id,
      depth: 1,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session is live
    if (session.status !== 'live') {
      return NextResponse.json(
        { error: 'Session is not currently live' },
        { status: 400 }
      );
    }

    // Check if user is registered (if required)
    const settings = session.settings as Record<string, unknown> | undefined;
    if (settings?.requiresRegistration) {
      const registration = await payload.find({
        collection: 'session-attendance',
        where: {
          session: { equals: id },
          user: { equals: user.id },
        },
        limit: 1,
      });

      if (registration.docs.length === 0) {
        return NextResponse.json(
          { error: 'You must register before joining' },
          { status: 403 }
        );
      }
    }

    // Find or create attendance record
    const existingAttendance = await payload.find({
      collection: 'session-attendance',
      where: {
        session: { equals: id },
        user: { equals: user.id },
      },
      limit: 1,
    });

    const now = new Date().toISOString();
    let attendance;

    if (existingAttendance.docs.length > 0) {
      // Update existing attendance
      const existing = existingAttendance.docs[0];
      const attendanceEvents = (existing.attendance as Array<{ event: string; timestamp: string }>) || [];

      attendance = await payload.update({
        collection: 'session-attendance',
        id: existing.id,
        data: {
          status: 'joined',
          joinedAt: existing.joinedAt || now,
          attendance: [
            ...attendanceEvents,
            { event: 'joined', timestamp: now },
          ],
        },
      });
    } else {
      // Create new attendance record
      attendance = await payload.create({
        collection: 'session-attendance',
        data: {
          session: id,
          user: user.id,
          status: 'joined',
          registeredAt: now,
          joinedAt: now,
          attendance: [{ event: 'joined', timestamp: now }],
        },
      });
    }

    // Update session stats
    const stats = session.stats as Record<string, unknown> | undefined;
    const currentAttendees = ((stats?.attendees as number) || 0) + 1;
    const peakAttendees = Math.max(currentAttendees, (stats?.peakAttendees as number) || 0);

    await payload.update({
      collection: 'live-sessions',
      id,
      data: {
        stats: {
          ...stats,
          attendees: currentAttendees,
          peakAttendees,
        },
      },
    });

    // Return join URL
    const platform = session.platform as Record<string, unknown> | undefined;

    return NextResponse.json({
      success: true,
      joinUrl: platform?.joinUrl,
      embedCode: platform?.embedCode,
      attendance,
    });
  } catch (error) {
    console.error('Session join error:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

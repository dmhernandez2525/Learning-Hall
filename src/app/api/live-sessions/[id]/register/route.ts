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

    // Check if session is open for registration
    if (!['published', 'scheduled'].includes(session.status as string)) {
      return NextResponse.json(
        { error: 'Registration is not available for this session' },
        { status: 400 }
      );
    }

    // Check if already registered
    const existing = await payload.find({
      collection: 'session-attendance',
      where: {
        session: { equals: id },
        user: { equals: user.id },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: 'Already registered for this session' },
        { status: 400 }
      );
    }

    // Check max attendees limit
    const settings = session.settings as Record<string, unknown> | undefined;
    if (settings?.maxAttendees) {
      const registrationCount = await payload.count({
        collection: 'session-attendance',
        where: { session: { equals: id } },
      });

      if (registrationCount.totalDocs >= (settings.maxAttendees as number)) {
        return NextResponse.json(
          { error: 'Session is at full capacity' },
          { status: 400 }
        );
      }
    }

    // Check enrollment requirement
    if (settings?.requiresEnrollment && session.course) {
      const courseId = typeof session.course === 'object'
        ? session.course.id
        : session.course;

      const enrollments = await payload.find({
        collection: 'enrollments',
        where: {
          user: { equals: user.id },
          course: { equals: courseId },
          status: { equals: 'active' },
        },
        limit: 1,
      });

      if (enrollments.docs.length === 0) {
        return NextResponse.json(
          { error: 'You must be enrolled in the course to register' },
          { status: 403 }
        );
      }
    }

    // Create registration
    const attendance = await payload.create({
      collection: 'session-attendance',
      data: {
        session: id,
        user: user.id,
        status: 'registered',
        registeredAt: new Date().toISOString(),
      },
    });

    // Update session registration count
    const stats = session.stats as Record<string, unknown> | undefined;
    await payload.update({
      collection: 'live-sessions',
      id,
      data: {
        stats: {
          ...stats,
          registrations: ((stats?.registrations as number) || 0) + 1,
        },
      },
    });

    return NextResponse.json(
      { success: true, registration: attendance },
      { status: 201 }
    );
  } catch (error) {
    console.error('Session registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register for session' },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });

    // Find and delete registration
    const existing = await payload.find({
      collection: 'session-attendance',
      where: {
        session: { equals: id },
        user: { equals: user.id },
      },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      return NextResponse.json(
        { error: 'Not registered for this session' },
        { status: 404 }
      );
    }

    // Only allow cancellation if not yet joined
    if (existing.docs[0].status !== 'registered') {
      return NextResponse.json(
        { error: 'Cannot cancel after joining the session' },
        { status: 400 }
      );
    }

    await payload.delete({
      collection: 'session-attendance',
      id: existing.docs[0].id,
    });

    // Update session registration count
    const session = await payload.findByID({
      collection: 'live-sessions',
      id,
    });

    if (session) {
      const stats = session.stats as Record<string, unknown> | undefined;
      await payload.update({
        collection: 'live-sessions',
        id,
        data: {
          stats: {
            ...stats,
            registrations: Math.max(0, ((stats?.registrations as number) || 0) - 1),
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session unregister error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}

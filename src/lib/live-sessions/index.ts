import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Where } from 'payload';

export type LiveSessionProvider = 'zoom' | 'google-meet' | 'microsoft-teams' | 'custom-rtmp';

export interface SessionSettings {
  waitingRoom?: boolean;
  autoRecord?: boolean;
  allowChat?: boolean;
  allowQA?: boolean;
  maxParticipants?: number;
}

export interface CreateSessionParams {
  title: string;
  courseId?: string;
  lessonId?: string;
  instructorId: string;
  tenantId?: string;
  provider: LiveSessionProvider;
  scheduledAt: Date;
  duration: number;
  settings?: SessionSettings;
}

export interface JoinSessionResult {
  success: boolean;
  joinUrl?: string;
  error?: string;
}

/**
 * Create a new live session
 */
export async function createLiveSession(params: CreateSessionParams) {
  const payload = await getPayload({ config });

  const session = await payload.create({
    collection: 'live-sessions',
    data: {
      title: params.title,
      course: params.courseId,
      lesson: params.lessonId,
      instructor: params.instructorId,
      tenant: params.tenantId,
      platform: params.provider,
      scheduledAt: params.scheduledAt.toISOString(),
      duration: params.duration,
      status: 'scheduled',
      settings: {
        waitingRoom: params.settings?.waitingRoom ?? true,
        autoRecord: params.settings?.autoRecord ?? false,
        allowChat: params.settings?.allowChat ?? true,
        allowQA: params.settings?.allowQA ?? true,
        maxParticipants: params.settings?.maxParticipants ?? 100,
      },
    },
  });

  // Generate join URLs based on provider
  const urls = await generateSessionUrls(session.id, params.provider);

  // Update session with generated URLs
  await payload.update({
    collection: 'live-sessions',
    id: session.id,
    data: {
      hostUrl: urls.hostUrl,
      joinUrl: urls.joinUrl,
    },
  });

  return { ...session, ...urls };
}

/**
 * Generate session URLs based on provider
 */
async function generateSessionUrls(
  sessionId: string | number,
  provider: LiveSessionProvider
): Promise<{ hostUrl: string; joinUrl: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  switch (provider) {
    case 'zoom':
      // In production, integrate with Zoom SDK
      return {
        hostUrl: `${baseUrl}/live/${sessionId}/host?provider=zoom`,
        joinUrl: `${baseUrl}/live/${sessionId}/join?provider=zoom`,
      };

    case 'google-meet':
      // In production, integrate with Google Calendar API
      return {
        hostUrl: `${baseUrl}/live/${sessionId}/host?provider=google-meet`,
        joinUrl: `${baseUrl}/live/${sessionId}/join?provider=google-meet`,
      };

    case 'microsoft-teams':
      // In production, integrate with Microsoft Graph API
      return {
        hostUrl: `${baseUrl}/live/${sessionId}/host?provider=teams`,
        joinUrl: `${baseUrl}/live/${sessionId}/join?provider=teams`,
      };

    case 'custom-rtmp':
      return {
        hostUrl: `${baseUrl}/live/${sessionId}/broadcast`,
        joinUrl: `${baseUrl}/live/${sessionId}/watch`,
      };

    default:
      return {
        hostUrl: `${baseUrl}/live/${sessionId}/host`,
        joinUrl: `${baseUrl}/live/${sessionId}/join`,
      };
  }
}

/**
 * Start a live session
 */
export async function startSession(sessionId: string | number, userId: string) {
  const payload = await getPayload({ config });

  const session = await payload.findByID({
    collection: 'live-sessions',
    id: sessionId,
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.instructor !== userId) {
    throw new Error('Only the instructor can start the session');
  }

  const updated = await payload.update({
    collection: 'live-sessions',
    id: sessionId,
    data: {
      status: 'live',
      startedAt: new Date().toISOString(),
    },
  });

  return updated;
}

/**
 * End a live session
 */
export async function endSession(sessionId: string | number, userId: string) {
  const payload = await getPayload({ config });

  const session = await payload.findByID({
    collection: 'live-sessions',
    id: sessionId,
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.instructor !== userId) {
    throw new Error('Only the instructor can end the session');
  }

  const endedAt = new Date();
  const startedAt = session.startedAt ? new Date(session.startedAt) : endedAt;
  const actualDuration = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  const updated = await payload.update({
    collection: 'live-sessions',
    id: sessionId,
    data: {
      status: 'ended',
      endedAt: endedAt.toISOString(),
      actualDuration,
    },
  });

  // Update attendance records
  await finalizeAttendance(sessionId);

  return updated;
}

/**
 * Join a live session
 */
export async function joinSession(
  sessionId: string | number,
  userId: string
): Promise<JoinSessionResult> {
  const payload = await getPayload({ config });

  const session = await payload.findByID({
    collection: 'live-sessions',
    id: sessionId,
  });

  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  if (session.status !== 'live' && session.status !== 'scheduled') {
    return { success: false, error: 'Session is not available' };
  }

  // Check if user already has attendance record
  const existingAttendance = await payload.find({
    collection: 'session-attendance',
    where: {
      and: [
        { session: { equals: sessionId } },
        { user: { equals: userId } },
      ],
    },
    limit: 1,
  });

  if (existingAttendance.docs.length === 0) {
    // Create attendance record
    await payload.create({
      collection: 'session-attendance',
      data: {
        session: sessionId,
        user: userId,
        status: 'joined',
        joinedAt: new Date().toISOString(),
      },
    });
  } else {
    // Update existing attendance
    await payload.update({
      collection: 'session-attendance',
      id: existingAttendance.docs[0].id,
      data: {
        status: 'joined',
        joinedAt: new Date().toISOString(),
      },
    });
  }

  return {
    success: true,
    joinUrl: session.joinUrl as string | undefined,
  };
}

/**
 * Leave a live session
 */
export async function leaveSession(sessionId: string | number, userId: string) {
  const payload = await getPayload({ config });

  const attendance = await payload.find({
    collection: 'session-attendance',
    where: {
      and: [
        { session: { equals: sessionId } },
        { user: { equals: userId } },
      ],
    },
    limit: 1,
  });

  if (attendance.docs.length > 0) {
    const record = attendance.docs[0];
    const joinedAt = record.joinedAt ? new Date(record.joinedAt) : new Date();
    const leftAt = new Date();
    const duration = Math.round((leftAt.getTime() - joinedAt.getTime()) / 60000);

    await payload.update({
      collection: 'session-attendance',
      id: record.id,
      data: {
        status: 'left',
        leftAt: leftAt.toISOString(),
        duration: (record.duration || 0) + duration,
      },
    });
  }
}

/**
 * Finalize attendance records when session ends
 */
async function finalizeAttendance(sessionId: string | number) {
  const payload = await getPayload({ config });

  const attendees = await payload.find({
    collection: 'session-attendance',
    where: {
      and: [
        { session: { equals: sessionId } },
        { status: { equals: 'joined' } },
      ],
    },
    limit: 1000,
  });

  const now = new Date();

  for (const record of attendees.docs) {
    const joinedAt = record.joinedAt ? new Date(record.joinedAt) : now;
    const duration = Math.round((now.getTime() - joinedAt.getTime()) / 60000);

    await payload.update({
      collection: 'session-attendance',
      id: record.id,
      data: {
        status: 'completed',
        leftAt: now.toISOString(),
        duration: (record.duration || 0) + duration,
      },
    });
  }
}

/**
 * Get upcoming sessions for a course
 */
export async function getUpcomingSessions(courseId: string, limit = 10) {
  const payload = await getPayload({ config });

  const sessions = await payload.find({
    collection: 'live-sessions',
    where: {
      and: [
        { course: { equals: courseId } },
        { status: { in: ['scheduled', 'live'] } },
        { scheduledAt: { greater_than: new Date().toISOString() } },
      ],
    },
    sort: 'scheduledAt',
    limit,
  });

  return sessions.docs;
}

/**
 * Get session attendance stats
 */
export async function getSessionStats(sessionId: string | number) {
  const payload = await getPayload({ config });

  const attendance = await payload.find({
    collection: 'session-attendance',
    where: { session: { equals: sessionId } },
    limit: 1000,
  });

  const stats = {
    totalAttendees: attendance.docs.length,
    completed: attendance.docs.filter((a) => a.status === 'completed').length,
    joined: attendance.docs.filter((a) => a.status === 'joined').length,
    invited: attendance.docs.filter((a) => a.status === 'invited').length,
    averageDuration:
      attendance.docs.reduce((sum, a) => sum + (a.duration || 0), 0) /
      Math.max(attendance.docs.length, 1),
  };

  return stats;
}

/**
 * Cancel a scheduled session
 */
export async function cancelSession(sessionId: string | number, userId: string, reason?: string) {
  const payload = await getPayload({ config });

  const session = await payload.findByID({
    collection: 'live-sessions',
    id: sessionId,
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.instructor !== userId) {
    throw new Error('Only the instructor can cancel the session');
  }

  if (session.status !== 'scheduled') {
    throw new Error('Only scheduled sessions can be cancelled');
  }

  const updated = await payload.update({
    collection: 'live-sessions',
    id: sessionId,
    data: {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    },
  });

  return updated;
}

/**
 * Reschedule a session
 */
export async function rescheduleSession(
  sessionId: string | number,
  userId: string,
  newScheduledAt: Date
) {
  const payload = await getPayload({ config });

  const session = await payload.findByID({
    collection: 'live-sessions',
    id: sessionId,
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.instructor !== userId) {
    throw new Error('Only the instructor can reschedule the session');
  }

  if (session.status !== 'scheduled') {
    throw new Error('Only scheduled sessions can be rescheduled');
  }

  const updated = await payload.update({
    collection: 'live-sessions',
    id: sessionId,
    data: {
      scheduledAt: newScheduledAt.toISOString(),
    },
  });

  return updated;
}

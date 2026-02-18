import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  VirtualSession,
  SessionParticipant,
  BreakoutRoom,
  VirtualClassroomAnalytics,
} from '@/types/virtual-classroom';

// --------------- Formatters ---------------

export function formatSession(doc: Record<string, unknown>): VirtualSession {
  const course = doc.course as string | Record<string, unknown>;
  const host = doc.host as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    hostId: typeof host === 'object' ? String(host.id) : String(host ?? ''),
    hostName: typeof host === 'object' ? String((host as Record<string, unknown>).name ?? '') : '',
    scheduledAt: String(doc.scheduledAt ?? ''),
    duration: Number(doc.duration ?? 60),
    status: (doc.status as VirtualSession['status']) ?? 'scheduled',
    maxParticipants: Number(doc.maxParticipants ?? 100),
    participantCount: Number(doc.participantCount ?? 0),
    recordingUrl: String(doc.recordingUrl ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatParticipant(doc: Record<string, unknown>): SessionParticipant {
  const session = doc.session as string | Record<string, unknown>;
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    sessionId: typeof session === 'object' ? String(session.id) : String(session ?? ''),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object' ? String((user as Record<string, unknown>).name ?? '') : '',
    role: (doc.role as SessionParticipant['role']) ?? 'participant',
    joinedAt: String(doc.joinedAt ?? ''),
    leftAt: String(doc.leftAt ?? ''),
  };
}

export function formatBreakoutRoom(doc: Record<string, unknown>): BreakoutRoom {
  const session = doc.session as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    sessionId: typeof session === 'object' ? String(session.id) : String(session ?? ''),
    name: String(doc.name ?? ''),
    capacity: Number(doc.capacity ?? 10),
    participantCount: Number(doc.participantCount ?? 0),
    status: (doc.status as BreakoutRoom['status']) ?? 'open',
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Sessions ---------------

export async function listSessions(courseId?: string): Promise<VirtualSession[]> {
  const payload = await getPayloadClient();
  const where: Where = courseId ? { course: { equals: courseId } } : {};
  const result = await payload.find({
    collection: 'virtual-sessions',
    where,
    sort: '-scheduledAt',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatSession(doc as Record<string, unknown>));
}

interface CreateSessionInput {
  courseId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  maxParticipants?: number;
}

export async function createSession(input: CreateSessionInput, user: User): Promise<VirtualSession> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'virtual-sessions',
    data: {
      course: input.courseId,
      title: input.title,
      description: input.description ?? '',
      host: user.id,
      scheduledAt: input.scheduledAt,
      duration: input.duration,
      status: 'scheduled',
      maxParticipants: input.maxParticipants ?? 100,
      participantCount: 0,
      tenant: user.tenant,
    },
  });
  return formatSession(doc as Record<string, unknown>);
}

export async function updateSessionStatus(
  id: string,
  status: VirtualSession['status']
): Promise<VirtualSession> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'virtual-sessions',
    id,
    data: { status },
  });
  return formatSession(doc as Record<string, unknown>);
}

// --------------- Participants ---------------

export async function joinSession(sessionId: string, user: User): Promise<SessionParticipant> {
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: 'session-participants',
    where: { and: [{ session: { equals: sessionId } }, { user: { equals: user.id } }] },
    limit: 1,
    depth: 1,
  });

  if (existing.docs.length > 0) {
    return formatParticipant(existing.docs[0] as Record<string, unknown>);
  }

  const doc = await payload.create({
    collection: 'session-participants',
    data: {
      session: sessionId,
      user: user.id,
      role: 'participant',
      joinedAt: new Date().toISOString(),
      tenant: user.tenant,
    },
  });

  const session = await payload.findByID({ collection: 'virtual-sessions', id: sessionId, depth: 0 });
  const raw = session as Record<string, unknown>;
  await payload.update({
    collection: 'virtual-sessions',
    id: sessionId,
    data: { participantCount: Number(raw.participantCount ?? 0) + 1 },
  });

  return formatParticipant(doc as Record<string, unknown>);
}

export async function listParticipants(sessionId: string): Promise<SessionParticipant[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'session-participants',
    where: { session: { equals: sessionId } },
    limit: 200,
    depth: 1,
  });
  return result.docs.map((doc) => formatParticipant(doc as Record<string, unknown>));
}

// --------------- Breakout Rooms ---------------

export async function createBreakoutRoom(
  sessionId: string,
  name: string,
  capacity: number,
  user: User
): Promise<BreakoutRoom> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'breakout-rooms',
    data: {
      session: sessionId,
      name,
      capacity,
      participantCount: 0,
      status: 'open',
      tenant: user.tenant,
    },
  });
  return formatBreakoutRoom(doc as Record<string, unknown>);
}

export async function listBreakoutRooms(sessionId: string): Promise<BreakoutRoom[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'breakout-rooms',
    where: { session: { equals: sessionId } },
    sort: 'name',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatBreakoutRoom(doc as Record<string, unknown>));
}

// --------------- Analytics ---------------

export async function getVirtualClassroomAnalytics(): Promise<VirtualClassroomAnalytics> {
  const payload = await getPayloadClient();

  const sessions = await payload.find({ collection: 'virtual-sessions', limit: 500, depth: 0 });
  const participants = await payload.find({ collection: 'session-participants', limit: 1, depth: 0 });

  let liveSessions = 0;
  let completedSessions = 0;
  const sessionsByStatus: Record<string, number> = {};

  for (const doc of sessions.docs) {
    const raw = doc as Record<string, unknown>;
    const status = String(raw.status ?? 'scheduled');
    sessionsByStatus[status] = (sessionsByStatus[status] ?? 0) + 1;
    if (status === 'live') liveSessions += 1;
    if (status === 'completed') completedSessions += 1;
  }

  const totalParticipants = participants.totalDocs;
  const avgParticipants = sessions.totalDocs > 0
    ? Math.round(totalParticipants / sessions.totalDocs)
    : 0;

  return {
    totalSessions: sessions.totalDocs,
    liveSessions,
    completedSessions,
    totalParticipants,
    avgParticipants,
    sessionsByStatus,
  };
}

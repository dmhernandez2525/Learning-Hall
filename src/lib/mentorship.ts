import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  MentorProfile,
  MentorshipMatch,
  MentorshipSession,
  MentorshipAnalytics,
  AvailabilitySlot,
} from '@/types/mentorship';

function mapSlots(value: unknown): AvailabilitySlot[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      dayOfWeek: Number(row.dayOfWeek ?? 0),
      startTime: String(row.startTime ?? ''),
      endTime: String(row.endTime ?? ''),
    };
  });
}

function mapExpertise(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

export function formatMentorProfile(doc: Record<string, unknown>): MentorProfile {
  const user = doc.user as string | Record<string, unknown>;
  const tenant = doc.tenant as string | Record<string, unknown> | undefined;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    displayName: String(doc.displayName ?? ''),
    bio: String(doc.bio ?? ''),
    expertise: mapExpertise(doc.expertise),
    maxMentees: Number(doc.maxMentees ?? 5),
    activeMenteeCount: Number(doc.activeMenteeCount ?? 0),
    availableSlots: mapSlots(doc.availableSlots),
    status: (doc.status as MentorProfile['status']) ?? 'active',
    tenantId: tenant
      ? (typeof tenant === 'object' ? String(tenant.id) : String(tenant))
      : '',
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatMatch(doc: Record<string, unknown>): MentorshipMatch {
  const mentor = doc.mentor as string | Record<string, unknown>;
  const mentee = doc.mentee as string | Record<string, unknown>;
  const course = doc.course as string | Record<string, unknown>;
  const tenant = doc.tenant as string | Record<string, unknown> | undefined;

  const mentorName = typeof mentor === 'object'
    ? String((mentor as Record<string, unknown>).name ?? (mentor as Record<string, unknown>).email ?? '')
    : '';
  const menteeName = typeof mentee === 'object'
    ? String((mentee as Record<string, unknown>).name ?? (mentee as Record<string, unknown>).email ?? '')
    : '';

  return {
    id: String(doc.id),
    mentorId: typeof mentor === 'object' ? String(mentor.id) : String(mentor ?? ''),
    menteeId: typeof mentee === 'object' ? String(mentee.id) : String(mentee ?? ''),
    mentorName,
    menteeName,
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    status: (doc.status as MentorshipMatch['status']) ?? 'pending',
    matchedAt: String(doc.matchedAt ?? doc.createdAt ?? ''),
    completedAt: doc.completedAt ? String(doc.completedAt) : null,
    tenantId: tenant
      ? (typeof tenant === 'object' ? String(tenant.id) : String(tenant))
      : '',
  };
}

export function formatSession(doc: Record<string, unknown>): MentorshipSession {
  const match = doc.match as string | Record<string, unknown>;
  const mentor = doc.mentor as string | Record<string, unknown>;
  const mentee = doc.mentee as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    matchId: typeof match === 'object' ? String(match.id) : String(match ?? ''),
    mentorId: typeof mentor === 'object' ? String(mentor.id) : String(mentor ?? ''),
    menteeId: typeof mentee === 'object' ? String(mentee.id) : String(mentee ?? ''),
    scheduledAt: String(doc.scheduledAt ?? ''),
    durationMinutes: Number(doc.durationMinutes ?? 30),
    status: (doc.status as MentorshipSession['status']) ?? 'scheduled',
    notes: String(doc.notes ?? ''),
    menteeRating: doc.menteeRating != null ? Number(doc.menteeRating) : null,
    menteeFeedback: String(doc.menteeFeedback ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Mentor Profiles ---------------

export async function listMentors(
  filters?: { status?: string; expertise?: string }
): Promise<MentorProfile[]> {
  const payload = await getPayloadClient();
  const where: Where = {};
  if (filters?.status) {
    where.status = { equals: filters.status };
  }
  const result = await payload.find({
    collection: 'mentor-profiles',
    where,
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  let profiles = result.docs.map((doc) =>
    formatMentorProfile(doc as Record<string, unknown>)
  );
  if (filters?.expertise) {
    const tag = filters.expertise.toLowerCase();
    profiles = profiles.filter((p) =>
      p.expertise.some((e) => e.toLowerCase().includes(tag))
    );
  }
  return profiles;
}

export async function getMentorProfile(id: string): Promise<MentorProfile | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'mentor-profiles', id, depth: 0 });
    if (!doc) return null;
    return formatMentorProfile(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateMentorInput {
  displayName: string;
  bio: string;
  expertise: string[];
  maxMentees?: number;
  availableSlots?: AvailabilitySlot[];
}

export async function createMentorProfile(
  input: CreateMentorInput,
  user: User
): Promise<MentorProfile> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'mentor-profiles',
    data: {
      user: user.id,
      displayName: input.displayName,
      bio: input.bio,
      expertise: input.expertise,
      maxMentees: input.maxMentees ?? 5,
      activeMenteeCount: 0,
      availableSlots: input.availableSlots ?? [],
      status: 'active',
      tenant: user.tenant,
    },
  });
  return formatMentorProfile(doc as Record<string, unknown>);
}

export async function updateMentorProfile(
  id: string,
  data: Partial<CreateMentorInput & { status: MentorProfile['status'] }>
): Promise<MentorProfile> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'mentor-profiles',
    id,
    data,
  });
  return formatMentorProfile(doc as Record<string, unknown>);
}

// --------------- Matches ---------------

export async function listMatchesForUser(userId: string): Promise<MentorshipMatch[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'mentorship-matches',
    where: {
      or: [
        { mentor: { equals: userId } },
        { mentee: { equals: userId } },
      ],
    },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => formatMatch(doc as Record<string, unknown>));
}

interface RequestMatchInput {
  mentorProfileId: string;
  courseId: string;
}

export async function requestMatch(
  input: RequestMatchInput,
  user: User
): Promise<MentorshipMatch> {
  const payload = await getPayloadClient();

  const profile = await payload.findByID({
    collection: 'mentor-profiles',
    id: input.mentorProfileId,
    depth: 0,
  });
  const raw = profile as Record<string, unknown>;
  const mentorUserId = typeof raw.user === 'object'
    ? String((raw.user as Record<string, unknown>).id)
    : String(raw.user ?? '');

  if (mentorUserId === user.id) {
    throw new Error('Cannot request mentorship with yourself');
  }

  const activeMenteeCount = Number(raw.activeMenteeCount ?? 0);
  const maxMentees = Number(raw.maxMentees ?? 5);
  if (activeMenteeCount >= maxMentees) {
    throw new Error('Mentor has reached maximum mentee capacity');
  }

  const doc = await payload.create({
    collection: 'mentorship-matches',
    data: {
      mentor: mentorUserId,
      mentee: user.id,
      course: input.courseId,
      status: 'pending',
      matchedAt: new Date().toISOString(),
      tenant: user.tenant,
    },
  });

  return formatMatch(doc as Record<string, unknown>);
}

export async function updateMatchStatus(
  matchId: string,
  status: MentorshipMatch['status']
): Promise<MentorshipMatch> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = { status };

  if (status === 'completed') {
    updateData.completedAt = new Date().toISOString();
  }

  const doc = await payload.update({
    collection: 'mentorship-matches',
    id: matchId,
    data: updateData,
  });

  if (status === 'active') {
    await incrementMentorMenteeCount(doc as Record<string, unknown>, 1);
  } else if (status === 'completed' || status === 'cancelled') {
    await incrementMentorMenteeCount(doc as Record<string, unknown>, -1);
  }

  return formatMatch(doc as Record<string, unknown>);
}

async function incrementMentorMenteeCount(
  matchDoc: Record<string, unknown>,
  delta: number
): Promise<void> {
  const payload = await getPayloadClient();
  const mentorUserId = typeof matchDoc.mentor === 'object'
    ? String((matchDoc.mentor as Record<string, unknown>).id)
    : String(matchDoc.mentor ?? '');

  const profiles = await payload.find({
    collection: 'mentor-profiles',
    where: { user: { equals: mentorUserId } },
    limit: 1,
    depth: 0,
  });

  if (profiles.docs.length > 0) {
    const profile = profiles.docs[0] as Record<string, unknown>;
    const current = Number(profile.activeMenteeCount ?? 0);
    await payload.update({
      collection: 'mentor-profiles',
      id: String(profile.id),
      data: { activeMenteeCount: Math.max(0, current + delta) },
    });
  }
}

// --------------- Sessions ---------------

export async function listSessionsForMatch(
  matchId: string
): Promise<MentorshipSession[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'mentorship-sessions',
    where: { match: { equals: matchId } },
    sort: '-scheduledAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatSession(doc as Record<string, unknown>));
}

interface CreateSessionInput {
  matchId: string;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}

export async function createSession(
  input: CreateSessionInput,
  user: User
): Promise<MentorshipSession> {
  const payload = await getPayloadClient();

  const match = await payload.findByID({
    collection: 'mentorship-matches',
    id: input.matchId,
    depth: 0,
  });
  const raw = match as Record<string, unknown>;
  const mentorId = typeof raw.mentor === 'object'
    ? String((raw.mentor as Record<string, unknown>).id)
    : String(raw.mentor ?? '');
  const menteeId = typeof raw.mentee === 'object'
    ? String((raw.mentee as Record<string, unknown>).id)
    : String(raw.mentee ?? '');

  const doc = await payload.create({
    collection: 'mentorship-sessions',
    data: {
      match: input.matchId,
      mentor: mentorId,
      mentee: menteeId,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes ?? 30,
      status: 'scheduled',
      notes: input.notes ?? '',
      tenant: user.tenant,
    },
  });

  return formatSession(doc as Record<string, unknown>);
}

interface UpdateSessionInput {
  status?: MentorshipSession['status'];
  notes?: string;
  menteeRating?: number;
  menteeFeedback?: string;
}

export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput
): Promise<MentorshipSession> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'mentorship-sessions',
    id: sessionId,
    data: input,
  });
  return formatSession(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getMentorAnalytics(
  mentorUserId: string
): Promise<MentorshipAnalytics> {
  const payload = await getPayloadClient();

  const matches = await payload.find({
    collection: 'mentorship-matches',
    where: { mentor: { equals: mentorUserId } },
    limit: 200,
    depth: 0,
  });

  const totalMatches = matches.docs.length;
  let activeMatches = 0;
  let completedMatches = 0;

  for (const doc of matches.docs) {
    const raw = doc as Record<string, unknown>;
    const status = String(raw.status ?? '');
    if (status === 'active') activeMatches += 1;
    if (status === 'completed') completedMatches += 1;
  }

  const sessions = await payload.find({
    collection: 'mentorship-sessions',
    where: { mentor: { equals: mentorUserId } },
    limit: 500,
    depth: 0,
  });

  let completedSessions = 0;
  let cancelledSessions = 0;
  let noShowSessions = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const doc of sessions.docs) {
    const raw = doc as Record<string, unknown>;
    const status = String(raw.status ?? '');
    if (status === 'completed') completedSessions += 1;
    if (status === 'cancelled') cancelledSessions += 1;
    if (status === 'no-show') noShowSessions += 1;
    if (raw.menteeRating != null) {
      ratingSum += Number(raw.menteeRating);
      ratingCount += 1;
    }
  }

  return {
    totalMatches,
    activeMatches,
    completedMatches,
    totalSessions: sessions.docs.length,
    completedSessions,
    averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    cancelledSessions,
    noShowSessions,
  };
}

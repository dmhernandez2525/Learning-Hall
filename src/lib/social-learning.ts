import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  StudyGroup,
  CollaborativeNote,
  PeerTeachingSession,
  SocialLearningAnalytics,
} from '@/types/social-learning';

// --------------- Formatters ---------------

export function formatGroup(doc: Record<string, unknown>): StudyGroup {
  const course = doc.course as string | Record<string, unknown>;
  const createdBy = doc.createdBy as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    name: String(doc.name ?? ''),
    description: String(doc.description ?? ''),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    maxMembers: Number(doc.maxMembers ?? 20),
    memberCount: Number(doc.memberCount ?? 0),
    isPublic: Boolean(doc.isPublic),
    createdBy: typeof createdBy === 'object' ? String(createdBy.id) : String(createdBy ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatNote(doc: Record<string, unknown>): CollaborativeNote {
  const group = doc.group as string | Record<string, unknown>;
  const author = doc.author as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    groupId: typeof group === 'object' ? String(group.id) : String(group ?? ''),
    title: String(doc.title ?? ''),
    content: String(doc.content ?? ''),
    authorId: typeof author === 'object' ? String(author.id) : String(author ?? ''),
    authorName: typeof author === 'object' ? String((author as Record<string, unknown>).name ?? '') : '',
    lastEditedAt: String(doc.lastEditedAt ?? doc.updatedAt ?? ''),
  };
}

export function formatSession(doc: Record<string, unknown>): PeerTeachingSession {
  const group = doc.group as string | Record<string, unknown>;
  const teacher = doc.teacher as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    groupId: typeof group === 'object' ? String(group.id) : String(group ?? ''),
    teacherId: typeof teacher === 'object' ? String(teacher.id) : String(teacher ?? ''),
    teacherName: typeof teacher === 'object' ? String((teacher as Record<string, unknown>).name ?? '') : '',
    topic: String(doc.topic ?? ''),
    scheduledAt: String(doc.scheduledAt ?? ''),
    duration: Number(doc.duration ?? 30),
    status: (doc.status as PeerTeachingSession['status']) ?? 'scheduled',
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Study Groups ---------------

export async function listStudyGroups(courseId?: string): Promise<StudyGroup[]> {
  const payload = await getPayloadClient();
  const where: Where = courseId ? { course: { equals: courseId } } : {};
  const result = await payload.find({
    collection: 'study-groups',
    where,
    sort: 'name',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatGroup(doc as Record<string, unknown>));
}

interface CreateGroupInput {
  name: string;
  description?: string;
  courseId: string;
  maxMembers?: number;
  isPublic?: boolean;
}

export async function createStudyGroup(input: CreateGroupInput, user: User): Promise<StudyGroup> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'study-groups',
    data: {
      name: input.name,
      description: input.description ?? '',
      course: input.courseId,
      maxMembers: input.maxMembers ?? 20,
      memberCount: 1,
      isPublic: input.isPublic ?? true,
      createdBy: user.id,
      members: [user.id],
      tenant: user.tenant,
    },
  });
  return formatGroup(doc as Record<string, unknown>);
}

export async function joinStudyGroup(groupId: string, user: User): Promise<StudyGroup> {
  const payload = await getPayloadClient();
  const group = await payload.findByID({ collection: 'study-groups', id: groupId, depth: 0 });
  const raw = group as Record<string, unknown>;
  const members = Array.isArray(raw.members) ? (raw.members as string[]) : [];

  if (members.includes(user.id)) {
    return formatGroup(raw);
  }

  const doc = await payload.update({
    collection: 'study-groups',
    id: groupId,
    data: {
      members: [...members, user.id],
      memberCount: Number(raw.memberCount ?? 0) + 1,
    },
  });
  return formatGroup(doc as Record<string, unknown>);
}

// --------------- Collaborative Notes ---------------

export async function listNotes(groupId: string): Promise<CollaborativeNote[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'collaborative-notes',
    where: { group: { equals: groupId } },
    sort: '-updatedAt',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatNote(doc as Record<string, unknown>));
}

interface CreateNoteInput {
  groupId: string;
  title: string;
  content: string;
}

export async function createNote(input: CreateNoteInput, user: User): Promise<CollaborativeNote> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'collaborative-notes',
    data: {
      group: input.groupId,
      title: input.title,
      content: input.content,
      author: user.id,
      lastEditedAt: new Date().toISOString(),
      tenant: user.tenant,
    },
  });
  return formatNote(doc as Record<string, unknown>);
}

// --------------- Peer Teaching ---------------

export async function listPeerSessions(groupId?: string): Promise<PeerTeachingSession[]> {
  const payload = await getPayloadClient();
  const where: Where = groupId ? { group: { equals: groupId } } : {};
  const result = await payload.find({
    collection: 'peer-teaching-sessions',
    where,
    sort: '-scheduledAt',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatSession(doc as Record<string, unknown>));
}

interface CreateSessionInput {
  groupId: string;
  topic: string;
  scheduledAt: string;
  duration: number;
}

export async function createPeerSession(input: CreateSessionInput, user: User): Promise<PeerTeachingSession> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'peer-teaching-sessions',
    data: {
      group: input.groupId,
      teacher: user.id,
      topic: input.topic,
      scheduledAt: input.scheduledAt,
      duration: input.duration,
      status: 'scheduled',
      tenant: user.tenant,
    },
  });
  return formatSession(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getSocialLearningAnalytics(): Promise<SocialLearningAnalytics> {
  const payload = await getPayloadClient();

  const groups = await payload.find({ collection: 'study-groups', limit: 500, depth: 0 });
  const notes = await payload.find({ collection: 'collaborative-notes', limit: 1, depth: 0 });
  const sessions = await payload.find({ collection: 'peer-teaching-sessions', limit: 1, depth: 0 });

  let activeGroups = 0;
  const groupsBySize: Record<string, number> = {};

  for (const doc of groups.docs) {
    const raw = doc as Record<string, unknown>;
    const count = Number(raw.memberCount ?? 0);
    if (count > 0) activeGroups += 1;

    const sizeLabel = count <= 5 ? 'small (1-5)' : count <= 15 ? 'medium (6-15)' : 'large (16+)';
    groupsBySize[sizeLabel] = (groupsBySize[sizeLabel] ?? 0) + 1;
  }

  return {
    totalGroups: groups.totalDocs,
    activeGroups,
    totalNotes: notes.totalDocs,
    totalSessions: sessions.totalDocs,
    groupsBySize,
  };
}

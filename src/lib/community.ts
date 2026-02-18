import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  UserProfile,
  ActivityFeedItem,
  DirectMessage,
  CommunityAnalytics,
} from '@/types/community';

// --------------- Formatters ---------------

export function formatProfile(doc: Record<string, unknown>): UserProfile {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    displayName: String(doc.displayName ?? ''),
    bio: String(doc.bio ?? ''),
    avatarUrl: String(doc.avatarUrl ?? ''),
    interests: Array.isArray(doc.interests) ? (doc.interests as string[]) : [],
    isPublic: Boolean(doc.isPublic),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatActivity(doc: Record<string, unknown>): ActivityFeedItem {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    userName: typeof user === 'object' ? String((user as Record<string, unknown>).name ?? '') : '',
    action: (doc.action as ActivityFeedItem['action']) ?? 'posted',
    targetType: String(doc.targetType ?? ''),
    targetId: String(doc.targetId ?? ''),
    targetTitle: String(doc.targetTitle ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatMessage(doc: Record<string, unknown>): DirectMessage {
  const sender = doc.sender as string | Record<string, unknown>;
  const recipient = doc.recipient as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    senderId: typeof sender === 'object' ? String(sender.id) : String(sender ?? ''),
    senderName: typeof sender === 'object' ? String((sender as Record<string, unknown>).name ?? '') : '',
    recipientId: typeof recipient === 'object' ? String(recipient.id) : String(recipient ?? ''),
    recipientName: typeof recipient === 'object' ? String((recipient as Record<string, unknown>).name ?? '') : '',
    subject: String(doc.subject ?? ''),
    body: String(doc.body ?? ''),
    isRead: Boolean(doc.isRead),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Profiles ---------------

export async function listProfiles(publicOnly?: boolean): Promise<UserProfile[]> {
  const payload = await getPayloadClient();
  const where: Where = publicOnly ? { isPublic: { equals: true } } : {};
  const result = await payload.find({
    collection: 'user-profiles',
    where,
    sort: 'displayName',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatProfile(doc as Record<string, unknown>));
}

interface UpsertProfileInput {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  interests?: string[];
  isPublic?: boolean;
}

export async function upsertProfile(input: UpsertProfileInput, user: User): Promise<UserProfile> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'user-profiles',
    where: { user: { equals: user.id } },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    const doc = await payload.update({
      collection: 'user-profiles',
      id: String(existing.docs[0].id),
      data: {
        displayName: input.displayName,
        bio: input.bio ?? '',
        avatarUrl: input.avatarUrl ?? '',
        interests: input.interests ?? [],
        isPublic: input.isPublic ?? true,
      },
    });
    return formatProfile(doc as Record<string, unknown>);
  }

  const doc = await payload.create({
    collection: 'user-profiles',
    data: {
      user: user.id,
      displayName: input.displayName,
      bio: input.bio ?? '',
      avatarUrl: input.avatarUrl ?? '',
      interests: input.interests ?? [],
      isPublic: input.isPublic ?? true,
      tenant: user.tenant,
    },
  });
  return formatProfile(doc as Record<string, unknown>);
}

// --------------- Activity Feed ---------------

export async function listActivities(userId?: string): Promise<ActivityFeedItem[]> {
  const payload = await getPayloadClient();
  const where: Where = userId ? { user: { equals: userId } } : {};
  const result = await payload.find({
    collection: 'activity-feed',
    where,
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => formatActivity(doc as Record<string, unknown>));
}

interface CreateActivityInput {
  action: ActivityFeedItem['action'];
  targetType: string;
  targetId: string;
  targetTitle: string;
}

export async function createActivity(input: CreateActivityInput, user: User): Promise<ActivityFeedItem> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'activity-feed',
    data: {
      user: user.id,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      targetTitle: input.targetTitle,
      tenant: user.tenant,
    },
  });
  return formatActivity(doc as Record<string, unknown>);
}

// --------------- Messages ---------------

export async function listMessages(userId: string): Promise<DirectMessage[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'direct-messages',
    where: {
      or: [
        { sender: { equals: userId } },
        { recipient: { equals: userId } },
      ],
    } as Where,
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  });
  return result.docs.map((doc) => formatMessage(doc as Record<string, unknown>));
}

interface SendMessageInput {
  recipientId: string;
  subject: string;
  body: string;
}

export async function sendMessage(input: SendMessageInput, user: User): Promise<DirectMessage> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'direct-messages',
    data: {
      sender: user.id,
      recipient: input.recipientId,
      subject: input.subject,
      body: input.body,
      isRead: false,
      tenant: user.tenant,
    },
  });
  return formatMessage(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getCommunityAnalytics(): Promise<CommunityAnalytics> {
  const payload = await getPayloadClient();

  const profiles = await payload.find({ collection: 'user-profiles', limit: 500, depth: 0 });
  const messages = await payload.find({ collection: 'direct-messages', limit: 1, depth: 0 });
  const activities = await payload.find({ collection: 'activity-feed', limit: 500, depth: 0 });

  let publicProfiles = 0;
  const activitiesByAction: Record<string, number> = {};

  for (const doc of profiles.docs) {
    if (Boolean((doc as Record<string, unknown>).isPublic)) publicProfiles += 1;
  }

  for (const doc of activities.docs) {
    const action = String((doc as Record<string, unknown>).action ?? 'posted');
    activitiesByAction[action] = (activitiesByAction[action] ?? 0) + 1;
  }

  return {
    totalProfiles: profiles.totalDocs,
    publicProfiles,
    totalMessages: messages.totalDocs,
    totalActivities: activities.totalDocs,
    activitiesByAction,
  };
}

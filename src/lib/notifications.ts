import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  Notification,
  EmailDigestConfig,
  PushSubscription,
  NotificationAnalytics,
} from '@/types/notifications';

// --------------- Formatters ---------------

export function formatNotification(doc: Record<string, unknown>): Notification {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    type: (doc.type as Notification['type']) ?? 'info',
    title: String(doc.title ?? ''),
    message: String(doc.message ?? ''),
    isRead: Boolean(doc.isRead),
    link: String(doc.link ?? ''),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatDigestConfig(doc: Record<string, unknown>): EmailDigestConfig {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    frequency: (doc.frequency as EmailDigestConfig['frequency']) ?? 'weekly',
    isEnabled: Boolean(doc.isEnabled),
    lastSentAt: String(doc.lastSentAt ?? ''),
  };
}

export function formatPushSubscription(doc: Record<string, unknown>): PushSubscription {
  const user = doc.user as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    userId: typeof user === 'object' ? String(user.id) : String(user ?? ''),
    endpoint: String(doc.endpoint ?? ''),
    keys: typeof doc.keys === 'object' ? JSON.stringify(doc.keys) : String(doc.keys ?? ''),
    isActive: Boolean(doc.isActive),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Notifications ---------------

export async function listNotifications(userId?: string): Promise<Notification[]> {
  const payload = await getPayloadClient();
  const where: Where = userId ? { user: { equals: userId } } : {};
  const result = await payload.find({
    collection: 'notifications',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatNotification(doc as Record<string, unknown>));
}

interface CreateNotificationInput {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput, user: User): Promise<Notification> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'notifications',
    data: {
      user: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      link: input.link ?? '',
      tenant: user.tenant,
    },
  });
  return formatNotification(doc as Record<string, unknown>);
}

export async function markAsRead(notificationId: string): Promise<Notification> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'notifications',
    id: notificationId,
    data: { isRead: true },
  });
  return formatNotification(doc as Record<string, unknown>);
}

export async function markAllRead(userId: string): Promise<number> {
  const payload = await getPayloadClient();
  const unread = await payload.find({
    collection: 'notifications',
    where: {
      user: { equals: userId },
      isRead: { equals: false },
    } as Where,
    limit: 500,
    depth: 0,
  });

  let count = 0;
  for (const doc of unread.docs) {
    await payload.update({
      collection: 'notifications',
      id: String(doc.id),
      data: { isRead: true },
    });
    count += 1;
  }
  return count;
}

// --------------- Digest Config ---------------

export async function getDigestConfig(userId: string): Promise<EmailDigestConfig | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'email-digest-configs',
    where: { user: { equals: userId } } as Where,
    limit: 1,
    depth: 0,
  });
  if (result.docs.length === 0) return null;
  return formatDigestConfig(result.docs[0] as Record<string, unknown>);
}

interface UpsertDigestInput {
  frequency: EmailDigestConfig['frequency'];
  isEnabled: boolean;
}

export async function upsertDigestConfig(input: UpsertDigestInput, user: User): Promise<EmailDigestConfig> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'email-digest-configs',
    where: { user: { equals: user.id } } as Where,
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    const doc = await payload.update({
      collection: 'email-digest-configs',
      id: String(existing.docs[0].id),
      data: { frequency: input.frequency, isEnabled: input.isEnabled },
    });
    return formatDigestConfig(doc as Record<string, unknown>);
  }

  const doc = await payload.create({
    collection: 'email-digest-configs',
    data: {
      user: user.id,
      frequency: input.frequency,
      isEnabled: input.isEnabled,
      tenant: user.tenant,
    },
  });
  return formatDigestConfig(doc as Record<string, unknown>);
}

// --------------- Analytics ---------------

export async function getNotificationAnalytics(): Promise<NotificationAnalytics> {
  const payload = await getPayloadClient();
  const all = await payload.find({ collection: 'notifications', limit: 500, depth: 0 });

  let unreadCount = 0;
  const notificationsByType: Record<string, number> = {};

  for (const doc of all.docs) {
    const raw = doc as Record<string, unknown>;
    if (!raw.isRead) unreadCount += 1;
    const t = String(raw.type ?? 'info');
    notificationsByType[t] = (notificationsByType[t] ?? 0) + 1;
  }

  const totalNotifications = all.totalDocs;
  const readCount = totalNotifications - unreadCount;
  const readRate = totalNotifications > 0 ? Math.round((readCount / totalNotifications) * 100) : 0;

  return {
    totalNotifications,
    unreadCount,
    readRate,
    notificationsByType,
  };
}

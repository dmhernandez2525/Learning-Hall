'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Notification } from '@/types/notifications';

const typeColors: Record<string, string> = {
  info: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  alert: '#ef4444',
};

export function NotificationInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/notifications/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.docs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading notifications...</p>;

  if (notifications.length === 0) {
    return <p className="text-sm text-muted-foreground">No notifications yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notification Inbox</h2>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg border p-3 flex items-center justify-between ${n.isRead ? 'opacity-60' : ''}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: typeColors[n.type] ?? '#6b7280' }}
                >
                  {n.type}
                </span>
                <span className="font-medium">{n.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
            </div>
            <span className="text-xs text-muted-foreground">{n.isRead ? 'Read' : 'Unread'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

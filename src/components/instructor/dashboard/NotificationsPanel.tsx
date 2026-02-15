'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { EnrollmentNotification } from '@/lib/instructor-dashboard/types';

interface NotificationsPanelProps {
  notifications: EnrollmentNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
}

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
}: NotificationsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Live Enrollments
            </CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} new notifications` : 'All caught up'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enrollment notifications yet.</p>
        ) : (
          <ul className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {notifications.map((notification) => (
              <li key={notification.enrollmentId} className="rounded-md border p-3">
                <p className="text-sm font-medium">{notification.studentName} enrolled</p>
                <p className="text-xs text-muted-foreground">{notification.courseTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.studentEmail || 'No email available'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {formatTimestamp(notification.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


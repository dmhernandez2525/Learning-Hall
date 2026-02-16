export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

export interface EmailDigestConfig {
  id: string;
  userId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isEnabled: boolean;
  lastSentAt: string;
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: string;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationAnalytics {
  totalNotifications: number;
  unreadCount: number;
  readRate: number;
  notificationsByType: Record<string, number>;
}

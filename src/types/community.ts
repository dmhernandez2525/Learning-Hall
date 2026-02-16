export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  action: 'enrolled' | 'completed' | 'posted' | 'reviewed' | 'earned_badge';
  targetType: string;
  targetId: string;
  targetTitle: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunityAnalytics {
  totalProfiles: number;
  publicProfiles: number;
  totalMessages: number;
  totalActivities: number;
  activitiesByAction: Record<string, number>;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  maxMembers: number;
  memberCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CollaborativeNote {
  id: string;
  groupId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  lastEditedAt: string;
}

export interface PeerTeachingSession {
  id: string;
  groupId: string;
  teacherId: string;
  teacherName: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'active' | 'completed';
  createdAt: string;
}

export interface SocialLearningAnalytics {
  totalGroups: number;
  activeGroups: number;
  totalNotes: number;
  totalSessions: number;
  groupsBySize: Record<string, number>;
}

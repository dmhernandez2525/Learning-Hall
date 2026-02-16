export interface VirtualSession {
  id: string;
  courseId: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  maxParticipants: number;
  participantCount: number;
  recordingUrl: string;
  createdAt: string;
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  role: 'host' | 'presenter' | 'participant';
  joinedAt: string;
  leftAt: string;
}

export interface BreakoutRoom {
  id: string;
  sessionId: string;
  name: string;
  capacity: number;
  participantCount: number;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface WhiteboardSnapshot {
  id: string;
  sessionId: string;
  title: string;
  dataUrl: string;
  createdBy: string;
  createdAt: string;
}

export interface VirtualClassroomAnalytics {
  totalSessions: number;
  liveSessions: number;
  completedSessions: number;
  totalParticipants: number;
  avgParticipants: number;
  sessionsByStatus: Record<string, number>;
}

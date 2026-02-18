export interface MentorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  expertise: string[];
  maxMentees: number;
  activeMenteeCount: number;
  availableSlots: AvailabilitySlot[];
  status: 'active' | 'paused' | 'inactive';
  tenantId: string;
  createdAt: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface MentorshipMatch {
  id: string;
  mentorId: string;
  menteeId: string;
  mentorName: string;
  menteeName: string;
  courseId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  matchedAt: string;
  completedAt: string | null;
  tenantId: string;
}

export interface MentorshipSession {
  id: string;
  matchId: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  menteeRating: number | null;
  menteeFeedback: string;
  createdAt: string;
}

export interface MentorshipAnalytics {
  totalMatches: number;
  activeMatches: number;
  completedMatches: number;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  cancelledSessions: number;
  noShowSessions: number;
}

export interface RubricCriterion {
  criterionId: string;
  title: string;
  description: string;
  maxPoints: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  lessonId?: string;
  instructorId: string;
  status: 'draft' | 'published' | 'closed';
  dueDate?: string;
  maxScore: number;
  allowLateSubmission: boolean;
  latePenaltyPercent: number;
  maxResubmissions: number;
  submissionTypes: string[];
  rubric: RubricCriterion[];
  enablePeerReview: boolean;
  peerReviewsRequired: number;
  createdAt: string;
  updatedAt: string;
}

export interface RubricScore {
  criterionId: string;
  score: number;
  comment: string;
}

export interface PeerReview {
  reviewerId: string;
  score?: number;
  feedback: string;
  reviewedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  content: string;
  fileUrl?: string;
  linkUrl?: string;
  submittedAt?: string;
  isLate: boolean;
  submissionVersion: number;
  score?: number;
  feedback?: string;
  rubricScores: RubricScore[];
  gradedBy?: string;
  gradedAt?: string;
  peerReviews: PeerReview[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAnalytics {
  totalSubmissions: number;
  gradedCount: number;
  averageScore: number;
  onTimeCount: number;
  lateCount: number;
  scoreDistribution: Array<{ range: string; count: number }>;
  criteriaAverages: Array<{ criterionId: string; title: string; average: number; maxPoints: number }>;
}

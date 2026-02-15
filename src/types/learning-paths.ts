export interface PathStep {
  stepId: string;
  courseId: string;
  courseTitle: string;
  order: number;
  isRequired: boolean;
  prerequisiteStepIds: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  slug: string;
  instructorId: string;
  status: 'draft' | 'published' | 'archived';
  steps: PathStep[];
  estimatedHours: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PathStepProgress {
  stepId: string;
  courseId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completionPercent: number;
  completedAt?: string;
}

export interface LearningPathProgress {
  id: string;
  pathId: string;
  userId: string;
  steps: PathStepProgress[];
  overallPercent: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface LearningPathSummary {
  id: string;
  title: string;
  description: string;
  slug: string;
  stepCount: number;
  estimatedHours: number;
  enrollmentCount: number;
  status: 'draft' | 'published' | 'archived';
}

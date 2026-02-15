export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  courseId: string;
  organizationId: string;
  dueDate: string;
  isRequired: boolean;
  status: 'draft' | 'active' | 'archived';
  assigneeCount: number;
  completionCount: number;
  createdAt: string;
}

export interface ComplianceAssignment {
  id: string;
  requirementId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string;
  completedAt: string | null;
  courseProgressPercent: number;
}

export interface ComplianceReport {
  totalAssignments: number;
  completedCount: number;
  overdueCount: number;
  pendingCount: number;
  completionRate: number;
  overdueRate: number;
}

export interface TrainingAssignment {
  id: string;
  managerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  progressPercent: number;
  assignedAt: string;
  completedAt: string | null;
}

export interface TeamMemberProgress {
  userId: string;
  userName: string;
  userEmail: string;
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
  overdueAssignments: number;
  lastActivity: string | null;
}

export interface ManagerDashboardData {
  teamSize: number;
  totalAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  completionRate: number;
  teamMembers: TeamMemberProgress[];
}

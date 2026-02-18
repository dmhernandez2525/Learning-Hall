export interface Organization {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  tenantId: string;
  description: string;
  logoUrl: string;
  status: 'active' | 'inactive';
  memberCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  organizationId: string;
  parentDepartmentId: string | null;
  managerId: string | null;
  managerName: string;
  memberCount: number;
  createdAt: string;
}

export interface OrgMembership {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  departmentId: string | null;
  role: 'owner' | 'admin' | 'manager' | 'member';
  joinedAt: string;
}

export interface BulkProvisionResult {
  created: number;
  skipped: number;
  errors: string[];
}

export interface OrgAnalytics {
  totalMembers: number;
  departmentCount: number;
  activeUsers: number;
  averageCourseProgress: number;
}

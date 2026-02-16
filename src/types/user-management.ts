export interface UserGroup {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
}

export interface UserGroupMembership {
  id: string;
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: string;
}

export interface CustomField {
  id: string;
  organizationId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options: string[];
  isRequired: boolean;
  createdAt: string;
}

export interface BulkImportResult {
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface UserManagementAnalytics {
  totalUsers: number;
  totalGroups: number;
  totalCustomFields: number;
  usersByRole: Record<string, number>;
  recentSignups: number;
}

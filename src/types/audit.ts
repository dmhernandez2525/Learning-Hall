export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface AuditRetentionPolicy {
  id: string;
  organizationId: string;
  retentionDays: number;
  autoExport: boolean;
  exportFormat: 'csv' | 'json';
  isActive: boolean;
  createdAt: string;
}

export interface AuditAnalytics {
  totalEntries: number;
  entriesLast24h: number;
  entriesLast7d: number;
  topActions: Record<string, number>;
  topResources: Record<string, number>;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  createdBy: string;
  reportType: 'enrollment' | 'completion' | 'compliance' | 'revenue' | 'engagement' | 'custom';
  columns: ReportColumn[];
  filters: ReportFilter[];
  schedule: ReportSchedule | null;
  lastRunAt: string | null;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  sortable: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  exportFormat: 'csv' | 'json' | 'pdf';
  recipients: string[];
}

export interface ReportExecution {
  id: string;
  reportId: string;
  reportName: string;
  executedBy: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  exportFormat: 'csv' | 'json' | 'pdf';
  rowCount: number;
  fileUrl: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ReportRow {
  [key: string]: string | number | boolean | null;
}

export interface ReportResult {
  definition: ReportDefinition;
  rows: ReportRow[];
  totalRows: number;
  executedAt: string;
}

export interface ReportingAnalytics {
  totalReports: number;
  activeReports: number;
  scheduledReports: number;
  totalExecutions: number;
  executionsByType: Record<string, number>;
}

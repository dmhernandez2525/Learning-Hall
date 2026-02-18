export interface AccessibilityAudit {
  id: string;
  courseId: string;
  lessonId: string;
  auditorId: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  score: number;
  issues: AccessibilityIssue[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface AccessibilityIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  suggestion: string;
}

export interface KeyboardNavAudit {
  id: string;
  pageUrl: string;
  tabOrder: string[];
  trappedElements: string[];
  missingFocus: string[];
  passed: boolean;
  createdAt: string;
}

export interface ScreenReaderConfig {
  id: string;
  courseId: string;
  ariaLandmarks: boolean;
  altTextCoverage: number;
  headingHierarchy: boolean;
  liveRegions: boolean;
  createdAt: string;
}

export interface AccessibilityAnalytics {
  totalAudits: number;
  completedAudits: number;
  avgScore: number;
  totalIssues: number;
  issuesBySeverity: Record<string, number>;
}

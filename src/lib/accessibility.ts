import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  AccessibilityAudit,
  AccessibilityIssue,
  KeyboardNavAudit,
  ScreenReaderConfig,
  AccessibilityAnalytics,
} from '@/types/accessibility';

// --------------- Formatters ---------------

export function formatAudit(doc: Record<string, unknown>): AccessibilityAudit {
  const course = doc.course as string | Record<string, unknown>;
  const lesson = doc.lesson as string | Record<string, unknown>;
  const auditor = doc.auditor as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    lessonId: typeof lesson === 'object' ? String(lesson.id) : String(lesson ?? ''),
    auditorId: typeof auditor === 'object' ? String(auditor.id) : String(auditor ?? ''),
    wcagLevel: (doc.wcagLevel as AccessibilityAudit['wcagLevel']) ?? 'AA',
    score: Number(doc.score ?? 0),
    issues: Array.isArray(doc.issues) ? (doc.issues as AccessibilityIssue[]) : [],
    status: (doc.status as AccessibilityAudit['status']) ?? 'pending',
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatKeyboardAudit(doc: Record<string, unknown>): KeyboardNavAudit {
  return {
    id: String(doc.id),
    pageUrl: String(doc.pageUrl ?? ''),
    tabOrder: Array.isArray(doc.tabOrder) ? (doc.tabOrder as string[]) : [],
    trappedElements: Array.isArray(doc.trappedElements) ? (doc.trappedElements as string[]) : [],
    missingFocus: Array.isArray(doc.missingFocus) ? (doc.missingFocus as string[]) : [],
    passed: Boolean(doc.passed),
    createdAt: String(doc.createdAt ?? ''),
  };
}

export function formatScreenReaderConfig(doc: Record<string, unknown>): ScreenReaderConfig {
  const course = doc.course as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
    ariaLandmarks: Boolean(doc.ariaLandmarks),
    altTextCoverage: Number(doc.altTextCoverage ?? 0),
    headingHierarchy: Boolean(doc.headingHierarchy),
    liveRegions: Boolean(doc.liveRegions),
    createdAt: String(doc.createdAt ?? ''),
  };
}

// --------------- Audits ---------------

export async function listAudits(courseId?: string): Promise<AccessibilityAudit[]> {
  const payload = await getPayloadClient();
  const where: Where = courseId ? { course: { equals: courseId } } : {};
  const result = await payload.find({
    collection: 'accessibility-audits',
    where,
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatAudit(doc as Record<string, unknown>));
}

interface CreateAuditInput {
  courseId: string;
  lessonId: string;
  wcagLevel: AccessibilityAudit['wcagLevel'];
  score: number;
  issues: AccessibilityIssue[];
}

export async function createAudit(input: CreateAuditInput, user: User): Promise<AccessibilityAudit> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'accessibility-audits',
    data: {
      course: input.courseId,
      lesson: input.lessonId,
      auditor: user.id,
      wcagLevel: input.wcagLevel,
      score: input.score,
      issues: input.issues,
      status: 'completed',
      tenant: user.tenant,
    },
  });
  return formatAudit(doc as Record<string, unknown>);
}

// --------------- Keyboard Nav ---------------

export async function listKeyboardAudits(): Promise<KeyboardNavAudit[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'keyboard-nav-audits',
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatKeyboardAudit(doc as Record<string, unknown>));
}

interface CreateKeyboardAuditInput {
  pageUrl: string;
  tabOrder: string[];
  trappedElements?: string[];
  missingFocus?: string[];
  passed: boolean;
}

export async function createKeyboardAudit(input: CreateKeyboardAuditInput, user: User): Promise<KeyboardNavAudit> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'keyboard-nav-audits',
    data: {
      pageUrl: input.pageUrl,
      tabOrder: input.tabOrder,
      trappedElements: input.trappedElements ?? [],
      missingFocus: input.missingFocus ?? [],
      passed: input.passed,
      tenant: user.tenant,
    },
  });
  return formatKeyboardAudit(doc as Record<string, unknown>);
}

// --------------- Screen Reader ---------------

export async function listScreenReaderConfigs(courseId?: string): Promise<ScreenReaderConfig[]> {
  const payload = await getPayloadClient();
  const where: Where = courseId ? { course: { equals: courseId } } : {};
  const result = await payload.find({
    collection: 'screen-reader-configs',
    where,
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatScreenReaderConfig(doc as Record<string, unknown>));
}

// --------------- Analytics ---------------

export async function getAccessibilityAnalytics(): Promise<AccessibilityAnalytics> {
  const payload = await getPayloadClient();
  const audits = await payload.find({ collection: 'accessibility-audits', limit: 500, depth: 0 });

  let completedAudits = 0;
  let totalScore = 0;
  let totalIssues = 0;
  const issuesBySeverity: Record<string, number> = {};

  for (const doc of audits.docs) {
    const raw = doc as Record<string, unknown>;
    if (raw.status === 'completed') {
      completedAudits += 1;
      totalScore += Number(raw.score ?? 0);
    }
    const issues = Array.isArray(raw.issues) ? (raw.issues as AccessibilityIssue[]) : [];
    totalIssues += issues.length;
    for (const issue of issues) {
      issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] ?? 0) + 1;
    }
  }

  return {
    totalAudits: audits.totalDocs,
    completedAudits,
    avgScore: completedAudits > 0 ? Math.round(totalScore / completedAudits) : 0,
    totalIssues,
    issuesBySeverity,
  };
}

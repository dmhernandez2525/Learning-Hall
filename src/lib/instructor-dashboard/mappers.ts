import type {
  DashboardCourseRecord,
  DashboardEnrollmentRecord,
  DashboardLessonActivityRecord,
  DashboardQuizAttemptRecord,
  DashboardRevenueRecord,
  DashboardReviewRecord,
  EnrollmentNotification,
} from './types';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as UnknownRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function toId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  const relation = asRecord(value);
  if (!relation) {
    return '';
  }

  const id = relation.id;
  if (typeof id === 'string' || typeof id === 'number') {
    return String(id);
  }

  return '';
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toIsoDate(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return fallback;
}

export function mapCourseRecord(doc: unknown): DashboardCourseRecord | null {
  const record = asRecord(doc);
  if (!record) {
    return null;
  }

  const id = toId(record.id);
  if (!id) {
    return null;
  }

  const reviewStats = asRecord(record.reviewStats);

  return {
    id,
    title: toStringValue(record.title, 'Untitled Course'),
    status: toStringValue(record.status, 'draft'),
    averageRating: toNumber(reviewStats?.averageRating, 0),
  };
}

export function mapEnrollmentRecord(
  doc: unknown,
  fallbackDate: string
): DashboardEnrollmentRecord | null {
  const record = asRecord(doc);
  if (!record) {
    return null;
  }

  const id = toId(record.id);
  const courseId = toId(record.course);
  const userId = toId(record.user);

  if (!id || !courseId || !userId) {
    return null;
  }

  const statusValue = toStringValue(record.status, 'active');
  const status: DashboardEnrollmentRecord['status'] =
    statusValue === 'completed' || statusValue === 'expired'
      ? statusValue
      : 'active';

  return {
    id,
    courseId,
    userId,
    status,
    createdAt: toIsoDate(record.createdAt, fallbackDate),
  };
}

export function mapLessonActivityRecord(
  doc: unknown,
  fallbackDate: string
): DashboardLessonActivityRecord | null {
  const record = asRecord(doc);
  if (!record) {
    return null;
  }

  const id = toId(record.id);
  const courseId = toId(record.course);
  const userId = toId(record.user);
  if (!id || !courseId || !userId) {
    return null;
  }

  return {
    id,
    courseId,
    userId,
    lastPositionSeconds: Math.max(0, Math.round(toNumber(record.lastPosition, 0))),
    lastViewedAt: toIsoDate(record.lastViewedAt, fallbackDate),
  };
}

export function mapReviewRecord(doc: unknown, fallbackDate: string): DashboardReviewRecord | null {
  const record = asRecord(doc);
  if (!record) {
    return null;
  }

  const id = toId(record.id);
  const courseId = toId(record.course);
  if (!id || !courseId) {
    return null;
  }

  return {
    id,
    courseId,
    rating: Math.min(5, Math.max(0, toNumber(record.rating, 0))),
    createdAt: toIsoDate(record.createdAt, fallbackDate),
  };
}

export function mapQuizAttemptRecord(
  doc: unknown,
  quizToCourseId: Map<string, string>,
  fallbackDate: string
): DashboardQuizAttemptRecord | null {
  const record = asRecord(doc);
  if (!record) {
    return null;
  }

  const id = toId(record.id);
  const quizId = toId(record.quiz);
  const courseId = quizToCourseId.get(quizId);
  if (!id || !courseId) {
    return null;
  }

  return {
    id,
    courseId,
    percentage: Math.max(0, Math.min(100, toNumber(record.percentage, 0))),
    durationSeconds: Math.max(0, Math.round(toNumber(record.durationSeconds, 0))),
    createdAt: toIsoDate(record.createdAt, fallbackDate),
  };
}

function extractCourseIdsFromItems(items: unknown[], courseIds: Set<string>): string[] {
  const matches = items
    .map((item) => asRecord(item))
    .filter((item): item is UnknownRecord => item !== null)
    .map((item) => toId(item.course))
    .filter((courseId) => courseId.length > 0 && courseIds.has(courseId));

  return [...new Set(matches)];
}

export function mapRevenueRecords(
  doc: unknown,
  courseIds: Set<string>,
  fallbackDate: string
): DashboardRevenueRecord[] {
  const record = asRecord(doc);
  if (!record) {
    return [];
  }

  const items = asArray(record.items);
  const matchedCourseIds = extractCourseIdsFromItems(items, courseIds);
  if (matchedCourseIds.length === 0) {
    return [];
  }

  const amountCents = Math.max(0, Math.round(toNumber(record.amount, 0)));
  const splitAmount = matchedCourseIds.length > 0
    ? Math.round(amountCents / matchedCourseIds.length)
    : 0;
  const createdAt = toIsoDate(record.createdAt, fallbackDate);

  return matchedCourseIds.map((courseId) => ({
    courseId,
    amountCents: splitAmount,
    createdAt,
  }));
}

export function mapEnrollmentNotification(
  doc: unknown,
  fallbackDate: string
): EnrollmentNotification | null {
  const record = asRecord(doc);
  if (!record) {
    return null;
  }

  const enrollmentId = toId(record.id);
  const courseRecord = asRecord(record.course);
  const userRecord = asRecord(record.user);
  const courseId = courseRecord ? toId(courseRecord.id) : toId(record.course);
  if (!enrollmentId || !courseId) {
    return null;
  }

  const courseTitle = toStringValue(courseRecord?.title, 'Course');
  const studentName = toStringValue(userRecord?.name, 'New student');
  const studentEmail = toStringValue(userRecord?.email, '');

  return {
    enrollmentId,
    courseId,
    courseTitle,
    studentName,
    studentEmail,
    createdAt: toIsoDate(record.createdAt, fallbackDate),
  };
}


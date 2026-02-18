import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  AssignmentSubmission,
  AssignmentAnalytics,
  RubricScore,
  PeerReview,
} from '@/types/assignments';
import { getAssignment } from '@/lib/assignments';

function mapRubricScores(value: unknown): RubricScore[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      criterionId: String(row.criterionId ?? ''),
      score: Number(row.score ?? 0),
      comment: String(row.comment ?? ''),
    };
  });
}

function mapPeerReviews(value: unknown): PeerReview[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      reviewerId: String(row.reviewerId ?? ''),
      score: row.score != null ? Number(row.score) : undefined,
      feedback: String(row.feedback ?? ''),
      reviewedAt: String(row.reviewedAt ?? new Date().toISOString()),
    };
  });
}

function formatSubmission(doc: Record<string, unknown>): AssignmentSubmission {
  const assignment = doc.assignment as string | Record<string, unknown>;
  const student = doc.student as string | Record<string, unknown>;
  const course = doc.course as string | Record<string, unknown>;
  const grader = doc.gradedBy as string | Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    assignmentId: typeof assignment === 'object' ? String(assignment.id) : String(assignment),
    studentId: typeof student === 'object' ? String(student.id) : String(student),
    courseId: typeof course === 'object' ? String(course.id) : String(course),
    status: (doc.status as AssignmentSubmission['status']) ?? 'draft',
    content: String(doc.content ?? ''),
    fileUrl: doc.fileUrl ? String(doc.fileUrl) : undefined,
    linkUrl: doc.linkUrl ? String(doc.linkUrl) : undefined,
    submittedAt: doc.submittedAt ? String(doc.submittedAt) : undefined,
    isLate: Boolean(doc.isLate),
    submissionVersion: Number(doc.submissionVersion ?? 1),
    score: doc.score != null ? Number(doc.score) : undefined,
    feedback: doc.feedback ? String(doc.feedback) : undefined,
    rubricScores: mapRubricScores(doc.rubricScores),
    gradedBy: grader
      ? typeof grader === 'object' ? String(grader.id) : String(grader)
      : undefined,
    gradedAt: doc.gradedAt ? String(doc.gradedAt) : undefined,
    peerReviews: mapPeerReviews(doc.peerReviews),
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

export async function listSubmissions(
  assignmentId: string
): Promise<AssignmentSubmission[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'assignment-submissions',
    where: { assignment: { equals: assignmentId } },
    sort: '-createdAt',
    limit: 200,
    depth: 0,
  });
  return result.docs.map((doc) => formatSubmission(doc as Record<string, unknown>));
}

export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
): Promise<AssignmentSubmission | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'assignment-submissions',
    where: {
      and: [
        { assignment: { equals: assignmentId } },
        { student: { equals: studentId } },
      ],
    },
    sort: '-submissionVersion',
    limit: 1,
    depth: 0,
  });
  if (result.docs.length === 0) return null;
  return formatSubmission(result.docs[0] as Record<string, unknown>);
}

interface SubmitInput {
  content?: string;
  fileUrl?: string;
  linkUrl?: string;
}

export async function createSubmission(
  assignmentId: string,
  input: SubmitInput,
  user: User
): Promise<AssignmentSubmission> {
  const assignment = await getAssignment(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  const existing = await getStudentSubmission(assignmentId, user.id);
  const version = existing ? existing.submissionVersion + 1 : 1;

  if (existing && assignment.maxResubmissions > 0 && version > assignment.maxResubmissions + 1) {
    throw new Error('Maximum resubmissions exceeded');
  }

  const now = new Date().toISOString();
  const isLate = assignment.dueDate ? new Date(now) > new Date(assignment.dueDate) : false;

  if (isLate && !assignment.allowLateSubmission) {
    throw new Error('Late submissions are not allowed');
  }

  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'assignment-submissions',
    data: {
      assignment: assignmentId,
      student: user.id,
      course: assignment.courseId,
      tenant: user.tenant,
      status: 'submitted',
      content: input.content ?? '',
      fileUrl: input.fileUrl,
      linkUrl: input.linkUrl,
      submittedAt: now,
      isLate,
      submissionVersion: version,
    },
  });
  return formatSubmission(doc as Record<string, unknown>);
}

interface GradeInput {
  score: number;
  feedback?: string;
  rubricScores?: RubricScore[];
}

export async function gradeSubmission(
  submissionId: string,
  input: GradeInput,
  user: User
): Promise<AssignmentSubmission> {
  const payload = await getPayloadClient();
  const doc = await payload.update({
    collection: 'assignment-submissions',
    id: submissionId,
    data: {
      score: input.score,
      feedback: input.feedback ?? '',
      rubricScores: input.rubricScores ?? [],
      gradedBy: user.id,
      gradedAt: new Date().toISOString(),
      status: 'graded',
    },
  });
  return formatSubmission(doc as Record<string, unknown>);
}

function buildScoreDistribution(scores: number[], maxScore: number) {
  const ranges = [
    { range: '0-20%', min: 0, max: maxScore * 0.2 },
    { range: '21-40%', min: maxScore * 0.2, max: maxScore * 0.4 },
    { range: '41-60%', min: maxScore * 0.4, max: maxScore * 0.6 },
    { range: '61-80%', min: maxScore * 0.6, max: maxScore * 0.8 },
    { range: '81-100%', min: maxScore * 0.8, max: maxScore + 1 },
  ];

  return ranges.map(({ range, min, max }) => ({
    range,
    count: scores.filter((s) => s >= min && s < max).length,
  }));
}

export async function getAssignmentAnalytics(
  assignmentId: string
): Promise<AssignmentAnalytics> {
  const assignment = await getAssignment(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  const submissions = await listSubmissions(assignmentId);
  const submitted = submissions.filter((s) => s.status !== 'draft');
  const graded = submitted.filter((s) => s.status === 'graded');
  const scores = graded.map((s) => s.score ?? 0);
  const averageScore = scores.length > 0
    ? Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2))
    : 0;

  const onTimeCount = submitted.filter((s) => !s.isLate).length;
  const lateCount = submitted.filter((s) => s.isLate).length;
  const scoreDistribution = buildScoreDistribution(scores, assignment.maxScore);

  const criteriaAverages = assignment.rubric.map((criterion) => {
    const criterionScores = graded
      .map((s) => s.rubricScores.find((rs) => rs.criterionId === criterion.criterionId))
      .filter((rs): rs is RubricScore => rs != null)
      .map((rs) => rs.score);

    const average = criterionScores.length > 0
      ? Number((criterionScores.reduce((sum, s) => sum + s, 0) / criterionScores.length).toFixed(2))
      : 0;

    return {
      criterionId: criterion.criterionId,
      title: criterion.title,
      average,
      maxPoints: criterion.maxPoints,
    };
  });

  return {
    totalSubmissions: submitted.length,
    gradedCount: graded.length,
    averageScore,
    onTimeCount,
    lateCount,
    scoreDistribution,
    criteriaAverages,
  };
}

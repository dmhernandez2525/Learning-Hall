import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type { Assignment, RubricCriterion } from '@/types/assignments';

function mapRubric(value: unknown): RubricCriterion[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      criterionId: String(row.criterionId ?? `criterion-${index}`),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      maxPoints: Number(row.maxPoints ?? 0),
    };
  });
}

function formatAssignment(doc: Record<string, unknown>): Assignment {
  const course = doc.course as string | Record<string, unknown>;
  const lesson = doc.lesson as string | Record<string, unknown> | undefined;
  const instructor = doc.instructor as string | Record<string, unknown>;

  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    courseId: typeof course === 'object' ? String(course.id) : String(course),
    lessonId: lesson
      ? typeof lesson === 'object' ? String(lesson.id) : String(lesson)
      : undefined,
    instructorId: typeof instructor === 'object' ? String(instructor.id) : String(instructor),
    status: (doc.status as Assignment['status']) ?? 'draft',
    dueDate: doc.dueDate ? String(doc.dueDate) : undefined,
    maxScore: Number(doc.maxScore ?? 100),
    allowLateSubmission: Boolean(doc.allowLateSubmission),
    latePenaltyPercent: Number(doc.latePenaltyPercent ?? 10),
    maxResubmissions: Number(doc.maxResubmissions ?? 0),
    submissionTypes: Array.isArray(doc.submissionTypes)
      ? (doc.submissionTypes as string[])
      : ['text'],
    rubric: mapRubric(doc.rubric),
    enablePeerReview: Boolean(doc.enablePeerReview),
    peerReviewsRequired: Number(doc.peerReviewsRequired ?? 2),
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

export async function listAssignmentsForCourse(courseId: string): Promise<Assignment[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'assignments',
    where: { course: { equals: courseId } },
    sort: '-createdAt',
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => formatAssignment(doc as Record<string, unknown>));
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'assignments', id, depth: 0 });
    if (!doc) return null;
    return formatAssignment(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreateAssignmentInput {
  title: string;
  description: string;
  courseId: string;
  lessonId?: string;
  dueDate?: string;
  maxScore?: number;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number;
  maxResubmissions?: number;
  submissionTypes?: string[];
  rubric?: RubricCriterion[];
  enablePeerReview?: boolean;
  peerReviewsRequired?: number;
}

export async function createAssignment(
  input: CreateAssignmentInput,
  user: User
): Promise<Assignment> {
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: 'assignments',
    data: {
      title: input.title,
      description: input.description,
      course: input.courseId,
      lesson: input.lessonId,
      instructor: user.id,
      tenant: user.tenant,
      status: 'draft',
      dueDate: input.dueDate,
      maxScore: input.maxScore ?? 100,
      allowLateSubmission: input.allowLateSubmission ?? false,
      latePenaltyPercent: input.latePenaltyPercent ?? 10,
      maxResubmissions: input.maxResubmissions ?? 0,
      submissionTypes: input.submissionTypes ?? ['text'],
      rubric: input.rubric ?? [],
      enablePeerReview: input.enablePeerReview ?? false,
      peerReviewsRequired: input.peerReviewsRequired ?? 2,
    },
  });
  return formatAssignment(doc as Record<string, unknown>);
}

export async function updateAssignment(
  id: string,
  data: Partial<CreateAssignmentInput> & { status?: Assignment['status'] }
): Promise<Assignment> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
  if (data.allowLateSubmission !== undefined) updateData.allowLateSubmission = data.allowLateSubmission;
  if (data.latePenaltyPercent !== undefined) updateData.latePenaltyPercent = data.latePenaltyPercent;
  if (data.maxResubmissions !== undefined) updateData.maxResubmissions = data.maxResubmissions;
  if (data.submissionTypes !== undefined) updateData.submissionTypes = data.submissionTypes;
  if (data.rubric !== undefined) updateData.rubric = data.rubric;
  if (data.enablePeerReview !== undefined) updateData.enablePeerReview = data.enablePeerReview;
  if (data.peerReviewsRequired !== undefined) updateData.peerReviewsRequired = data.peerReviewsRequired;
  if (data.status !== undefined) updateData.status = data.status;

  const doc = await payload.update({ collection: 'assignments', id, data: updateData });
  return formatAssignment(doc as Record<string, unknown>);
}

export async function deleteAssignment(id: string): Promise<void> {
  const payload = await getPayloadClient();
  await payload.delete({ collection: 'assignments', id });
}

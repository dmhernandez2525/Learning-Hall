import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import type {
  LearningPath,
  LearningPathSummary,
  LearningPathProgress,
  PathStep,
  PathStepProgress,
} from '@/types/learning-paths';

function mapSteps(value: unknown): PathStep[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    const course = row.course as string | Record<string, unknown>;
    const prereqs = row.prerequisiteStepIds;
    return {
      stepId: String(row.stepId ?? `step-${index}`),
      courseId: typeof course === 'object' ? String(course.id) : String(course ?? ''),
      courseTitle: typeof course === 'object' ? String((course as Record<string, unknown>).title ?? '') : '',
      order: Number(row.order ?? index),
      isRequired: row.isRequired !== false,
      prerequisiteStepIds: Array.isArray(prereqs) ? (prereqs as string[]) : [],
    };
  });
}

function formatPath(doc: Record<string, unknown>): LearningPath {
  const instructor = doc.instructor as string | Record<string, unknown>;
  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    slug: String(doc.slug ?? ''),
    instructorId: typeof instructor === 'object' ? String(instructor.id) : String(instructor ?? ''),
    status: (doc.status as LearningPath['status']) ?? 'draft',
    steps: mapSteps(doc.steps),
    estimatedHours: Number(doc.estimatedHours ?? 0),
    enrollmentCount: Number(doc.enrollmentCount ?? 0),
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

function formatSummary(doc: Record<string, unknown>): LearningPathSummary {
  const steps = Array.isArray(doc.steps) ? doc.steps : [];
  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    slug: String(doc.slug ?? ''),
    stepCount: steps.length,
    estimatedHours: Number(doc.estimatedHours ?? 0),
    enrollmentCount: Number(doc.enrollmentCount ?? 0),
    status: (doc.status as LearningPathSummary['status']) ?? 'draft',
  };
}

export async function listLearningPaths(): Promise<LearningPathSummary[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'learning-paths',
    where: { status: { equals: 'published' } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  });
  return result.docs.map((doc) => formatSummary(doc as Record<string, unknown>));
}

export async function getLearningPath(id: string): Promise<LearningPath | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: 'learning-paths', id, depth: 1 });
    if (!doc) return null;
    return formatPath(doc as Record<string, unknown>);
  } catch {
    return null;
  }
}

interface CreatePathInput {
  title: string;
  description: string;
  estimatedHours?: number;
  steps?: Array<{
    stepId: string;
    courseId: string;
    order: number;
    isRequired?: boolean;
    prerequisiteStepIds?: string[];
  }>;
}

export async function createLearningPath(
  input: CreatePathInput,
  user: User
): Promise<LearningPath> {
  const payload = await getPayloadClient();
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const doc = await payload.create({
    collection: 'learning-paths',
    data: {
      title: input.title,
      description: input.description,
      slug,
      instructor: user.id,
      tenant: user.tenant,
      status: 'draft',
      estimatedHours: input.estimatedHours ?? 0,
      enrollmentCount: 0,
      steps: (input.steps ?? []).map((s) => ({
        stepId: s.stepId,
        course: s.courseId,
        order: s.order,
        isRequired: s.isRequired !== false,
        prerequisiteStepIds: s.prerequisiteStepIds ?? [],
      })),
    },
  });
  return formatPath(doc as Record<string, unknown>);
}

export async function updateLearningPath(
  id: string,
  data: Partial<CreatePathInput> & { status?: LearningPath['status'] }
): Promise<LearningPath> {
  const payload = await getPayloadClient();
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.steps !== undefined) {
    updateData.steps = data.steps.map((s) => ({
      stepId: s.stepId,
      course: s.courseId,
      order: s.order,
      isRequired: s.isRequired !== false,
      prerequisiteStepIds: s.prerequisiteStepIds ?? [],
    }));
  }

  const doc = await payload.update({ collection: 'learning-paths', id, data: updateData });
  return formatPath(doc as Record<string, unknown>);
}

function resolveStepStatuses(
  steps: PathStep[],
  completedCourseIds: Set<string>
): PathStepProgress[] {
  const completedStepIds = new Set<string>();

  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const result: PathStepProgress[] = [];

  for (const step of sorted) {
    const courseCompleted = completedCourseIds.has(step.courseId);
    if (courseCompleted) {
      completedStepIds.add(step.stepId);
    }

    const prereqsMet = step.prerequisiteStepIds.every((pid) => completedStepIds.has(pid));

    let status: PathStepProgress['status'] = 'locked';
    if (courseCompleted) {
      status = 'completed';
    } else if (prereqsMet) {
      status = 'available';
    }

    result.push({
      stepId: step.stepId,
      courseId: step.courseId,
      status,
      completionPercent: courseCompleted ? 100 : 0,
      completedAt: courseCompleted ? new Date().toISOString() : undefined,
    });
  }

  return result;
}

export async function enrollInPath(
  pathId: string,
  user: User
): Promise<LearningPathProgress> {
  const payload = await getPayloadClient();
  const path = await getLearningPath(pathId);
  if (!path) throw new Error('Learning path not found');

  const existing = await payload.find({
    collection: 'learning-path-progress',
    where: {
      and: [
        { path: { equals: pathId } },
        { user: { equals: user.id } },
      ],
    },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    throw new Error('Already enrolled in this path');
  }

  const stepProgress = resolveStepStatuses(path.steps, new Set());
  const doc = await payload.create({
    collection: 'learning-path-progress',
    data: {
      path: pathId,
      user: user.id,
      tenant: user.tenant,
      overallPercent: 0,
      enrolledAt: new Date().toISOString(),
      steps: stepProgress,
    },
  });

  await payload.update({
    collection: 'learning-paths',
    id: pathId,
    data: { enrollmentCount: path.enrollmentCount + 1 },
  });

  return {
    id: String(doc.id),
    pathId,
    userId: user.id,
    steps: stepProgress,
    overallPercent: 0,
    enrolledAt: new Date().toISOString(),
  };
}

export async function getPathProgress(
  pathId: string,
  userId: string
): Promise<LearningPathProgress | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'learning-path-progress',
    where: {
      and: [
        { path: { equals: pathId } },
        { user: { equals: userId } },
      ],
    },
    limit: 1,
    depth: 0,
  });

  if (result.docs.length === 0) return null;
  const doc = result.docs[0] as Record<string, unknown>;
  const steps = Array.isArray(doc.steps) ? (doc.steps as PathStepProgress[]) : [];
  const completed = steps.filter((s) => s.status === 'completed').length;
  const total = steps.length;

  return {
    id: String(doc.id),
    pathId,
    userId,
    steps,
    overallPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    enrolledAt: String(doc.enrolledAt ?? ''),
    completedAt: doc.completedAt ? String(doc.completedAt) : undefined,
  };
}

export { resolveStepStatuses };

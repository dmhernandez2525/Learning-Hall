import { getPayloadClient } from '@/lib/payload';
import type { Where } from 'payload';

export interface Module {
  id: string;
  title: string;
  description?: string;
  course: {
    id: string;
    title: string;
  };
  position: number;
  lessons?: {
    id: string;
    title: string;
    position: number;
    contentType: 'video' | 'text' | 'quiz' | 'assignment';
  }[];
  dripDelay: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleListParams {
  page?: number;
  limit?: number;
  courseId?: string;
  sort?: 'position' | '-position' | 'updatedAt' | '-updatedAt';
}

export interface ModuleListResult {
  docs: Module[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function formatModule(doc: Record<string, unknown>): Module {
  const course = doc.course as Record<string, unknown> | string;
  const lessons = doc.lessons as Array<Record<string, unknown>> | undefined;

  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    description: doc.description ? String(doc.description) : undefined,
    course:
      typeof course === 'object'
        ? {
            id: String(course.id),
            title: String(course.title || ''),
          }
        : { id: String(course), title: '' },
    position: Number(doc.position || 0),
    lessons: lessons?.map((lesson) => ({
      id: String(lesson.id),
      title: String(lesson.title || ''),
      position: Number(lesson.position || 0),
      contentType: (lesson.contentType as 'video' | 'text' | 'quiz' | 'assignment') || 'video',
    })),
    dripDelay: Number(doc.dripDelay || 0),
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

export async function listModules(params: ModuleListParams = {}): Promise<ModuleListResult> {
  const payload = await getPayloadClient();
  const { page = 1, limit = 50, courseId, sort = 'position' } = params;

  const where: Where | undefined = courseId
    ? { course: { equals: courseId } }
    : undefined;

  const result = await payload.find({
    collection: 'modules',
    page,
    limit,
    where,
    sort,
    depth: 2, // Include lessons
  });

  return {
    docs: result.docs.map((doc) => formatModule(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getModule(id: string): Promise<Module | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.findByID({
      collection: 'modules',
      id,
      depth: 2,
    });

    if (!result) return null;

    return formatModule(result as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getModulesByCourse(courseId: string): Promise<Module[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'modules',
    where: { course: { equals: courseId } },
    sort: 'position',
    limit: 100,
    depth: 2,
  });

  return result.docs.map((doc) => formatModule(doc as Record<string, unknown>));
}

export interface CreateModuleData {
  title: string;
  description?: string;
  courseId: string;
  position?: number;
  dripDelay?: number;
}

export async function createModule(data: CreateModuleData): Promise<Module> {
  const payload = await getPayloadClient();

  // If no position provided, place at end
  let position = data.position;
  if (position === undefined) {
    const existing = await payload.find({
      collection: 'modules',
      where: { course: { equals: data.courseId } },
      sort: '-position',
      limit: 1,
    });
    position = existing.docs.length > 0
      ? ((existing.docs[0] as Record<string, unknown>).position as number) + 1
      : 0;
  }

  const result = await payload.create({
    collection: 'modules',
    data: {
      title: data.title,
      description: data.description,
      course: data.courseId,
      position,
      dripDelay: data.dripDelay || 0,
    },
  });

  return formatModule(result as Record<string, unknown>);
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  position?: number;
  dripDelay?: number;
  lessons?: string[];
}

export async function updateModule(id: string, data: UpdateModuleData): Promise<Module> {
  const payload = await getPayloadClient();

  const result = await payload.update({
    collection: 'modules',
    id,
    data,
  });

  return formatModule(result as Record<string, unknown>);
}

export async function deleteModule(id: string): Promise<boolean> {
  try {
    const payload = await getPayloadClient();

    await payload.delete({
      collection: 'modules',
      id,
    });

    return true;
  } catch {
    return false;
  }
}

export async function reorderModules(
  courseId: string,
  moduleOrder: { id: string; position: number }[]
): Promise<Module[]> {
  const payload = await getPayloadClient();

  const updated: Module[] = [];

  for (const { id, position } of moduleOrder) {
    const result = await payload.update({
      collection: 'modules',
      id,
      data: { position },
    });
    updated.push(formatModule(result as Record<string, unknown>));
  }

  return updated.sort((a, b) => a.position - b.position);
}

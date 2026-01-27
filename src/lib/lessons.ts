import { getPayloadClient } from '@/lib/payload';
import type { Where } from 'payload';

export type ContentType = 'video' | 'text' | 'quiz' | 'assignment';

export interface LessonResource {
  id?: string;
  title: string;
  file: {
    id: string;
    url: string;
    filename?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  module: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
    };
  };
  position: number;
  contentType: ContentType;
  content: {
    videoUrl?: string;
    videoDuration?: number;
    videoThumbnail?: {
      id: string;
      url: string;
    };
    textContent?: unknown; // Rich text data
    quizData?: unknown; // JSON quiz data
    assignmentInstructions?: unknown; // Rich text
  };
  isPreview: boolean;
  estimatedDuration?: number;
  resources?: LessonResource[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonListParams {
  page?: number;
  limit?: number;
  moduleId?: string;
  courseId?: string;
  contentType?: ContentType;
  isPreview?: boolean;
  sort?: 'position' | '-position' | 'updatedAt' | '-updatedAt';
}

export interface LessonListResult {
  docs: Lesson[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function formatLesson(doc: Record<string, unknown>): Lesson {
  const module = doc.module as Record<string, unknown> | string;
  const content = doc.content as Record<string, unknown> | null;
  const resources = doc.resources as Array<Record<string, unknown>> | undefined;
  const videoThumbnail = content?.videoThumbnail as Record<string, unknown> | null;

  let formattedModule: Lesson['module'];
  if (typeof module === 'object') {
    const course = module.course as Record<string, unknown> | string | undefined;
    formattedModule = {
      id: String(module.id),
      title: String(module.title || ''),
      course: course
        ? typeof course === 'object'
          ? { id: String(course.id), title: String(course.title || '') }
          : { id: String(course), title: '' }
        : undefined,
    };
  } else {
    formattedModule = { id: String(module), title: '' };
  }

  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    module: formattedModule,
    position: Number(doc.position || 0),
    contentType: (doc.contentType as ContentType) || 'video',
    content: {
      videoUrl: content?.videoUrl ? String(content.videoUrl) : undefined,
      videoDuration: content?.videoDuration ? Number(content.videoDuration) : undefined,
      videoThumbnail: videoThumbnail
        ? {
            id: String(videoThumbnail.id),
            url: String(videoThumbnail.url || ''),
          }
        : undefined,
      textContent: content?.textContent,
      quizData: content?.quizData,
      assignmentInstructions: content?.assignmentInstructions,
    },
    isPreview: Boolean(doc.isPreview),
    estimatedDuration: doc.estimatedDuration ? Number(doc.estimatedDuration) : undefined,
    resources: resources?.map((r) => {
      const file = r.file as Record<string, unknown>;
      return {
        id: r.id ? String(r.id) : undefined,
        title: String(r.title || ''),
        file: {
          id: String(file.id),
          url: String(file.url || ''),
          filename: file.filename ? String(file.filename) : undefined,
        },
      };
    }),
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

export async function listLessons(params: LessonListParams = {}): Promise<LessonListResult> {
  const payload = await getPayloadClient();
  const { page = 1, limit = 50, moduleId, contentType, isPreview, sort = 'position' } = params;

  const conditions: Where[] = [];

  if (moduleId) {
    conditions.push({ module: { equals: moduleId } });
  }

  if (contentType) {
    conditions.push({ contentType: { equals: contentType } });
  }

  if (isPreview !== undefined) {
    conditions.push({ isPreview: { equals: isPreview } });
  }

  const where: Where | undefined =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : { and: conditions }
      : undefined;

  const result = await payload.find({
    collection: 'lessons',
    page,
    limit,
    where,
    sort,
    depth: 2,
  });

  return {
    docs: result.docs.map((doc) => formatLesson(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getLesson(id: string): Promise<Lesson | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.findByID({
      collection: 'lessons',
      id,
      depth: 2,
    });

    if (!result) return null;

    return formatLesson(result as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getLessonsByModule(moduleId: string): Promise<Lesson[]> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: 'lessons',
    where: { module: { equals: moduleId } },
    sort: 'position',
    limit: 100,
    depth: 2,
  });

  return result.docs.map((doc) => formatLesson(doc as Record<string, unknown>));
}

export interface CreateLessonData {
  title: string;
  moduleId: string;
  position?: number;
  contentType: ContentType;
  content?: {
    videoUrl?: string;
    videoDuration?: number;
    videoThumbnailId?: string;
    textContent?: unknown;
    quizData?: unknown;
    assignmentInstructions?: unknown;
  };
  isPreview?: boolean;
  estimatedDuration?: number;
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  const payload = await getPayloadClient();

  // If no position provided, place at end
  let position = data.position;
  if (position === undefined) {
    const existing = await payload.find({
      collection: 'lessons',
      where: { module: { equals: data.moduleId } },
      sort: '-position',
      limit: 1,
    });
    position = existing.docs.length > 0
      ? ((existing.docs[0] as Record<string, unknown>).position as number) + 1
      : 0;
  }

  const contentData: Record<string, unknown> = {};
  if (data.content) {
    if (data.content.videoUrl) contentData.videoUrl = data.content.videoUrl;
    if (data.content.videoDuration) contentData.videoDuration = data.content.videoDuration;
    if (data.content.videoThumbnailId) contentData.videoThumbnail = data.content.videoThumbnailId;
    if (data.content.textContent) contentData.textContent = data.content.textContent;
    if (data.content.quizData) contentData.quizData = data.content.quizData;
    if (data.content.assignmentInstructions)
      contentData.assignmentInstructions = data.content.assignmentInstructions;
  }

  const result = await payload.create({
    collection: 'lessons',
    data: {
      title: data.title,
      module: data.moduleId,
      position,
      contentType: data.contentType,
      content: Object.keys(contentData).length > 0 ? contentData : undefined,
      isPreview: data.isPreview || false,
      estimatedDuration: data.estimatedDuration,
    },
  });

  return formatLesson(result as Record<string, unknown>);
}

export interface UpdateLessonData {
  title?: string;
  position?: number;
  contentType?: ContentType;
  content?: {
    videoUrl?: string;
    videoDuration?: number;
    videoThumbnailId?: string;
    textContent?: unknown;
    quizData?: unknown;
    assignmentInstructions?: unknown;
  };
  isPreview?: boolean;
  estimatedDuration?: number;
}

export async function updateLesson(id: string, data: UpdateLessonData): Promise<Lesson> {
  const payload = await getPayloadClient();

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.contentType !== undefined) updateData.contentType = data.contentType;
  if (data.isPreview !== undefined) updateData.isPreview = data.isPreview;
  if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;

  if (data.content) {
    const contentData: Record<string, unknown> = {};
    if (data.content.videoUrl !== undefined) contentData.videoUrl = data.content.videoUrl;
    if (data.content.videoDuration !== undefined)
      contentData.videoDuration = data.content.videoDuration;
    if (data.content.videoThumbnailId !== undefined)
      contentData.videoThumbnail = data.content.videoThumbnailId;
    if (data.content.textContent !== undefined) contentData.textContent = data.content.textContent;
    if (data.content.quizData !== undefined) contentData.quizData = data.content.quizData;
    if (data.content.assignmentInstructions !== undefined)
      contentData.assignmentInstructions = data.content.assignmentInstructions;
    updateData.content = contentData;
  }

  const result = await payload.update({
    collection: 'lessons',
    id,
    data: updateData,
  });

  return formatLesson(result as Record<string, unknown>);
}

export async function deleteLesson(id: string): Promise<boolean> {
  try {
    const payload = await getPayloadClient();

    await payload.delete({
      collection: 'lessons',
      id,
    });

    return true;
  } catch {
    return false;
  }
}

export async function reorderLessons(
  moduleId: string,
  lessonOrder: { id: string; position: number }[]
): Promise<Lesson[]> {
  const payload = await getPayloadClient();

  const updated: Lesson[] = [];

  for (const { id, position } of lessonOrder) {
    const result = await payload.update({
      collection: 'lessons',
      id,
      data: { position },
    });
    updated.push(formatLesson(result as Record<string, unknown>));
  }

  return updated.sort((a, b) => a.position - b.position);
}

export async function moveLesson(lessonId: string, newModuleId: string): Promise<Lesson> {
  const payload = await getPayloadClient();

  // Get position at end of new module
  const existing = await payload.find({
    collection: 'lessons',
    where: { module: { equals: newModuleId } },
    sort: '-position',
    limit: 1,
  });
  const position = existing.docs.length > 0
    ? ((existing.docs[0] as Record<string, unknown>).position as number) + 1
    : 0;

  const result = await payload.update({
    collection: 'lessons',
    id: lessonId,
    data: {
      module: newModuleId,
      position,
    },
  });

  return formatLesson(result as Record<string, unknown>);
}

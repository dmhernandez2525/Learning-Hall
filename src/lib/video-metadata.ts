import { getPayloadClient } from '@/lib/payload';
import { getLesson } from '@/lib/lessons';
import type { User } from '@/lib/auth/config';
import type {
  LessonVideoMetadata,
  LessonVideoMetadataInput,
  VideoAnnotation,
  VideoChapter,
  VideoHotspot,
  VideoQualityOption,
} from '@/types/video-learning';

function mapChapters(value: unknown): VideoChapter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `chapter-${index}`),
      title: String(row.title ?? ''),
      timestamp: Number(row.timestamp ?? 0),
    };
  });
}

function mapHotspots(value: unknown): VideoHotspot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `hotspot-${index}`),
      label: String(row.label ?? ''),
      startTime: Number(row.startTime ?? 0),
      endTime: Number(row.endTime ?? 0),
      x: Number(row.x ?? 0),
      y: Number(row.y ?? 0),
      width: Number(row.width ?? 20),
      height: Number(row.height ?? 12),
      resourceUrl: String(row.resourceUrl ?? ''),
    };
  });
}

function mapAnnotations(value: unknown): VideoAnnotation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `annotation-${index}`),
      text: String(row.text ?? ''),
      timestamp: Number(row.timestamp ?? 0),
      duration: Number(row.duration ?? 4),
    };
  });
}

function mapQualityOptions(value: unknown): VideoQualityOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `quality-${index}`),
      label: String(row.label ?? ''),
      url: String(row.url ?? ''),
      mimeType: row.mimeType ? String(row.mimeType) : undefined,
    };
  });
}

function formatMetadata(doc: Record<string, unknown>): LessonVideoMetadata {
  const lesson = doc.lesson as string | Record<string, unknown>;
  const course = doc.course as string | Record<string, unknown>;

  return {
    id: String(doc.id),
    lessonId: typeof lesson === 'object' ? String(lesson.id) : String(lesson),
    courseId: typeof course === 'object' ? String(course.id) : String(course),
    chapters: mapChapters(doc.chapters),
    hotspots: mapHotspots(doc.hotspots),
    annotations: mapAnnotations(doc.annotations),
    transcriptVtt: String(doc.transcriptVtt ?? ''),
    qualityOptions: mapQualityOptions(doc.qualityOptions),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

export async function getVideoMetadataByLesson(
  lessonId: string
): Promise<LessonVideoMetadata | null> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'lesson-video-metadata',
    where: { lesson: { equals: lessonId } },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length === 0) {
    return null;
  }

  return formatMetadata(existing.docs[0] as Record<string, unknown>);
}

export async function upsertVideoMetadata(
  lessonId: string,
  input: LessonVideoMetadataInput,
  user: User
): Promise<LessonVideoMetadata> {
  const payload = await getPayloadClient();
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }

  const existing = await payload.find({
    collection: 'lesson-video-metadata',
    where: { lesson: { equals: lessonId } },
    limit: 1,
    depth: 0,
  });

  const data = {
    lesson: lessonId,
    course: lesson.module.course.id,
    tenant: user.tenant,
    updatedBy: user.id,
    chapters: input.chapters ?? [],
    hotspots: input.hotspots ?? [],
    annotations: input.annotations ?? [],
    transcriptVtt: input.transcriptVtt ?? '',
    qualityOptions: input.qualityOptions ?? [],
  };

  if (existing.docs.length > 0) {
    const updated = await payload.update({
      collection: 'lesson-video-metadata',
      id: String(existing.docs[0].id),
      data,
    });

    return formatMetadata(updated as Record<string, unknown>);
  }

  const created = await payload.create({
    collection: 'lesson-video-metadata',
    data,
  });

  return formatMetadata(created as Record<string, unknown>);
}

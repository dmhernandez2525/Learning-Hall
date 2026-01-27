import { getPayloadClient } from '@/lib/payload';
import { getLesson } from '@/lib/lessons';
import type { User } from '@/lib/auth/config';
import { requireCourseAccess } from '@/lib/courses/access';
import { sanitizeNoteHtml, extractPlainText } from '@/lib/richtext';
import type { Where } from 'payload';

export interface LessonNote {
  id: string;
  title: string;
  contentHtml: string;
  plainText: string;
  videoTimestamp?: number;
  lesson: {
    id: string;
    title?: string;
  };
  course: {
    id: string;
    title?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NoteListParams {
  courseId?: string;
  lessonId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NoteListResult {
  docs: LessonNote[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function formatNote(doc: Record<string, unknown>): LessonNote {
  const lesson = doc.lesson as Record<string, unknown> | string;
  const course = doc.course as Record<string, unknown> | string;
  const content = sanitizeNoteHtml(String(doc.content || ''));

  return {
    id: String(doc.id),
    title: String(doc.title || ''),
    contentHtml: content,
    plainText: doc.plainText ? String(doc.plainText) : extractPlainText(content),
    videoTimestamp: doc.videoTimestamp ? Number(doc.videoTimestamp) : undefined,
    lesson:
      typeof lesson === 'object'
        ? { id: String(lesson.id), title: lesson.title ? String(lesson.title) : undefined }
        : { id: String(lesson), title: undefined },
    course:
      typeof course === 'object'
        ? { id: String(course.id), title: course.title ? String(course.title) : undefined }
        : { id: String(course), title: undefined },
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

async function ensureUserOwnsNote(noteId: string, user: User) {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection: 'lesson-notes', id: noteId, depth: 2 });
  if (!doc) throw new Error('Note not found');
  if (user.role !== 'admin') {
    const ownerId =
      typeof doc.user === 'object' ? String((doc.user as Record<string, unknown>).id) : String(doc.user);
    if (ownerId !== user.id) {
      throw new Error('Not authorized');
    }
  }
  return doc as Record<string, unknown>;
}

export async function listLessonNotes(params: NoteListParams, user: User): Promise<NoteListResult> {
  const payload = await getPayloadClient();
  const { courseId, lessonId, search, page = 1, limit = 50 } = params;

  const where: Where[] = [];
  if (user.role !== 'admin') {
    where.push({ user: { equals: user.id } });
  }
  if (courseId) {
    where.push({ course: { equals: courseId } });
  }
  if (lessonId) {
    where.push({ lesson: { equals: lessonId } });
  }
  if (search) {
    where.push({ plainText: { contains: search } });
  }

  const result = await payload.find({
    collection: 'lesson-notes',
    page,
    limit,
    where: where.length ? (where.length === 1 ? where[0] : { and: where }) : undefined,
    sort: '-updatedAt',
    depth: 2,
  });

  return {
    docs: result.docs.map((doc) => formatNote(doc as Record<string, unknown>)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

export async function getLessonNote(id: string, user: User): Promise<LessonNote | null> {
  const payload = await getPayloadClient();
  const doc = await payload.findByID({ collection: 'lesson-notes', id, depth: 2 });
  if (!doc) return null;
  if (user.role !== 'admin') {
    const ownerId =
      typeof doc.user === 'object' ? String((doc.user as Record<string, unknown>).id) : String(doc.user);
    if (ownerId !== user.id) {
      throw new Error('Not authorized');
    }
  }
  return formatNote(doc as Record<string, unknown>);
}

export interface CreateNoteInput {
  lessonId: string;
  contentHtml: string;
  title: string;
  videoTimestamp?: number;
}

export async function createLessonNote(input: CreateNoteInput, user: User): Promise<LessonNote> {
  const lesson = await getLesson(input.lessonId);
  if (!lesson || !lesson.module?.course?.id) {
    throw new Error('Lesson not found');
  }

  await requireCourseAccess(lesson.module.course.id, user);

  const payload = await getPayloadClient();
  const sanitized = sanitizeNoteHtml(input.contentHtml);

  const note = await payload.create({
    collection: 'lesson-notes',
    data: {
      user: user.id,
      course: lesson.module.course.id,
      lesson: input.lessonId,
      title: input.title,
      content: sanitized,
      plainText: extractPlainText(sanitized),
      videoTimestamp: typeof input.videoTimestamp === 'number' ? input.videoTimestamp : undefined,
    },
  });

  return formatNote(note as Record<string, unknown>);
}

export interface UpdateNoteInput {
  title?: string;
  contentHtml?: string;
  videoTimestamp?: number | null;
}

export async function updateLessonNote(id: string, data: UpdateNoteInput, user: User): Promise<LessonNote> {
  await ensureUserOwnsNote(id, user);
  const payload = await getPayloadClient();

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.contentHtml !== undefined) {
    const sanitized = sanitizeNoteHtml(data.contentHtml);
    updateData.content = sanitized;
    updateData.plainText = extractPlainText(sanitized);
  }
  if (data.videoTimestamp !== undefined) {
    updateData.videoTimestamp = data.videoTimestamp === null ? undefined : data.videoTimestamp;
  }

  const updated = await payload.update({
    collection: 'lesson-notes',
    id,
    data: updateData,
  });

  return formatNote(updated as Record<string, unknown>);
}

export async function deleteLessonNote(id: string, user: User): Promise<boolean> {
  await ensureUserOwnsNote(id, user);
  const payload = await getPayloadClient();
  await payload.delete({ collection: 'lesson-notes', id });
  return true;
}

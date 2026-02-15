import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import { getLesson } from '@/lib/lessons';
import { requireCourseAccess } from '@/lib/courses/access';

export interface LessonBookmark {
  id: string;
  lesson: {
    id: string;
    title?: string;
  };
  course: {
    id: string;
    title?: string;
  };
  createdAt: string;
  videoTimestamp?: number;
  note?: string;
}

function formatBookmark(doc: Record<string, unknown>): LessonBookmark {
  const lesson = doc.lesson as Record<string, unknown> | string;
  const course = doc.course as Record<string, unknown> | string;
  return {
    id: String(doc.id),
    lesson:
      typeof lesson === 'object'
        ? { id: String(lesson.id), title: lesson.title ? String(lesson.title) : undefined }
        : { id: String(lesson), title: undefined },
    course:
      typeof course === 'object'
        ? { id: String(course.id), title: course.title ? String(course.title) : undefined }
        : { id: String(course), title: undefined },
    createdAt: String(doc.createdAt || new Date().toISOString()),
    videoTimestamp:
      doc.videoTimestamp !== undefined && doc.videoTimestamp !== null
        ? Number(doc.videoTimestamp)
        : undefined,
    note: doc.note ? String(doc.note) : undefined,
  };
}

export async function listLessonBookmarks(user: User, limit = 10): Promise<LessonBookmark[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'lesson-bookmarks',
    where: { user: { equals: user.id } },
    sort: 'position,createdAt',
    limit,
    depth: 2,
  });
  return result.docs.map((doc) => formatBookmark(doc as Record<string, unknown>));
}

export async function setLessonBookmark(lessonId: string, bookmark: boolean, user: User): Promise<boolean> {
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }
  await requireCourseAccess(lesson.module.course.id, user);

  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'lesson-bookmarks',
    where: {
      and: [
        { user: { equals: user.id } },
        { lesson: { equals: lessonId } },
      ],
    },
    limit: 1,
  });

  if (bookmark) {
    if (existing.totalDocs > 0) return true;
    await payload.create({
      collection: 'lesson-bookmarks',
      data: {
        user: user.id,
        lesson: lessonId,
        course: lesson.module.course.id,
        videoTimestamp: undefined,
        note: undefined,
      },
    });
    return true;
  }

  if (existing.totalDocs > 0) {
    await payload.delete({
      collection: 'lesson-bookmarks',
      id: String(existing.docs[0].id),
    });
  }
  return false;
}

export async function listVideoBookmarksForLesson(
  lessonId: string,
  user: User
): Promise<LessonBookmark[]> {
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }
  await requireCourseAccess(lesson.module.course.id, user);

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'lesson-bookmarks',
    where: {
      and: [
        { user: { equals: user.id } },
        { lesson: { equals: lessonId } },
      ],
    },
    sort: '-createdAt',
    limit: 100,
    depth: 2,
  });

  return result.docs.map((doc) => formatBookmark(doc as Record<string, unknown>));
}

export async function createVideoBookmark(
  lessonId: string,
  timestamp: number,
  note: string | undefined,
  user: User
): Promise<LessonBookmark> {
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }
  await requireCourseAccess(lesson.module.course.id, user);

  const payload = await getPayloadClient();
  const created = await payload.create({
    collection: 'lesson-bookmarks',
    data: {
      user: user.id,
      lesson: lessonId,
      course: lesson.module.course.id,
      videoTimestamp: Math.max(0, Math.floor(timestamp)),
      note: note?.trim() || undefined,
    },
  });

  return formatBookmark(created as Record<string, unknown>);
}

export async function deleteVideoBookmark(
  lessonId: string,
  bookmarkId: string,
  user: User
): Promise<void> {
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }
  await requireCourseAccess(lesson.module.course.id, user);

  const payload = await getPayloadClient();
  const bookmark = await payload.findByID({
    collection: 'lesson-bookmarks',
    id: bookmarkId,
    depth: 0,
  });

  const owner = String((bookmark as Record<string, unknown>).user ?? '');
  const bookmarkLesson = String((bookmark as Record<string, unknown>).lesson ?? '');
  if (owner !== user.id || bookmarkLesson !== lessonId) {
    throw new Error('Bookmark not found');
  }

  await payload.delete({
    collection: 'lesson-bookmarks',
    id: bookmarkId,
  });
}

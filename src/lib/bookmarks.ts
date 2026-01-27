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
    videoTimestamp: doc.videoTimestamp ? Number(doc.videoTimestamp) : undefined,
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

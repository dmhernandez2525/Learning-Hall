import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import { getLesson } from '@/lib/lessons';
import { requireCourseAccess } from '@/lib/courses/access';

export interface LessonActivityEntry {
  id: string;
  lesson: {
    id: string;
    title?: string;
  };
  course: {
    id: string;
    title?: string;
  };
  lastPosition?: number;
  lastViewedAt: string;
}

function formatActivity(doc: Record<string, unknown>): LessonActivityEntry {
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
    lastPosition: doc.lastPosition ? Number(doc.lastPosition) : undefined,
    lastViewedAt: String(doc.lastViewedAt || doc.updatedAt || new Date().toISOString()),
  };
}

export async function listRecentLessonActivity(user: User, limit = 5): Promise<LessonActivityEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'lesson-activity',
    where: { user: { equals: user.id } },
    sort: '-lastViewedAt',
    limit,
    depth: 2,
  });
  return result.docs.map((doc) => formatActivity(doc as Record<string, unknown>));
}

export async function getLessonActivity(
  lessonId: string,
  user: User
): Promise<LessonActivityEntry | null> {
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }
  await requireCourseAccess(lesson.module.course.id, user);

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'lesson-activity',
    where: {
      and: [
        { user: { equals: user.id } },
        { lesson: { equals: lessonId } },
      ],
    },
    limit: 1,
    depth: 2,
  });

  if (result.docs.length === 0) {
    return null;
  }

  return formatActivity(result.docs[0] as Record<string, unknown>);
}

export async function updateLessonActivity(
  lessonId: string,
  position: number | undefined,
  user: User
): Promise<LessonActivityEntry> {
  const lesson = await getLesson(lessonId);
  if (!lesson?.module?.course?.id) {
    throw new Error('Lesson not found');
  }
  await requireCourseAccess(lesson.module.course.id, user);
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: 'lesson-activity',
    where: {
      and: [
        { user: { equals: user.id } },
        { lesson: { equals: lessonId } },
      ],
    },
    limit: 1,
  });

  const data = {
    user: user.id,
    course: lesson.module.course.id,
    lesson: lessonId,
    lastPosition: typeof position === 'number' ? position : undefined,
    lastViewedAt: new Date().toISOString(),
  };

  if (existing.totalDocs > 0) {
    const updated = await payload.update({
      collection: 'lesson-activity',
      id: String(existing.docs[0].id),
      data,
    });
    return formatActivity(updated as Record<string, unknown>);
  }

  const created = await payload.create({
    collection: 'lesson-activity',
    data,
  });
  return formatActivity(created as Record<string, unknown>);
}

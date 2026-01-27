import { getPayloadClient } from '@/lib/payload';
import type { User } from '@/lib/auth/config';
import { requireCourseAccess } from '@/lib/courses/access';

export interface FavoriteCourse {
  id: string;
  course: {
    id: string;
    title?: string;
    shortDescription?: string;
    thumbnailUrl?: string;
  };
  createdAt: string;
}

function formatFavorite(doc: Record<string, unknown>): FavoriteCourse {
  const course = doc.course as Record<string, unknown> | string;
  const thumbnail = (course as Record<string, unknown>)?.thumbnail as Record<string, unknown> | undefined;

  return {
    id: String(doc.id),
    course:
      typeof course === 'object'
        ? {
            id: String(course.id),
            title: course.title ? String(course.title) : undefined,
            shortDescription: course.shortDescription ? String(course.shortDescription) : undefined,
            thumbnailUrl: thumbnail?.url ? String(thumbnail.url) : undefined,
          }
        : { id: String(course) },
    createdAt: String(doc.createdAt || new Date().toISOString()),
  };
}

export async function listFavoriteCourses(userId: string, limit = 8): Promise<FavoriteCourse[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'course-favorites',
    where: { user: { equals: userId } },
    depth: 2,
    sort: '-createdAt',
    limit,
  });

  return result.docs.map((doc) => formatFavorite(doc as Record<string, unknown>));
}

export async function setCourseFavorite(courseId: string, favorite: boolean, user: User): Promise<boolean> {
  await requireCourseAccess(courseId, user);
  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: 'course-favorites',
    where: {
      and: [
        { user: { equals: user.id } },
        { course: { equals: courseId } },
      ],
    },
    limit: 1,
  });

  if (favorite) {
    if (existing.totalDocs > 0) return true;
    await payload.create({
      collection: 'course-favorites',
      data: { user: user.id, course: courseId },
    });
    return true;
  }

  if (existing.totalDocs > 0) {
    await payload.delete({
      collection: 'course-favorites',
      id: String(existing.docs[0].id),
    });
  }
  return false;
}

export async function isCourseFavorite(courseId: string, userId: string): Promise<boolean> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'course-favorites',
    where: {
      and: [
        { user: { equals: userId } },
        { course: { equals: courseId } },
      ],
    },
    limit: 1,
  });
  return existing.totalDocs > 0;
}

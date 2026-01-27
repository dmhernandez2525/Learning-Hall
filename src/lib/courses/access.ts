import { getPayloadClient } from '@/lib/payload';
import { getCourse, type Course } from '@/lib/courses';
import type { User } from '@/lib/auth/config';

export async function requireCourseAccess(courseId: string, user: User): Promise<Course> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (user.role === 'admin') {
    return course;
  }

  if (user.role === 'instructor') {
    if (course.instructor?.id === user.id) {
      return course;
    }
    throw new Error('Not authorized for this course');
  }

  const payload = await getPayloadClient();
  const enrollment = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { user: { equals: user.id } },
        { course: { equals: courseId } },
        { status: { not_equals: 'expired' } },
      ],
    },
    limit: 1,
  });

  if (enrollment.totalDocs === 0) {
    throw new Error('Please enroll in the course to access this lesson');
  }

  return course;
}

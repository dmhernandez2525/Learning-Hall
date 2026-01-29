import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Mobile-optimized course detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config });

    // Get user from auth header
    const userId = request.headers.get('X-User-Id');

    const course = await payload.findByID({
      collection: 'courses',
      id,
      depth: 2,
    });

    if (!course || course.status !== 'published') {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get enrollment status if user is authenticated
    let enrollment = null;
    let progress = null;

    if (userId) {
      const enrollments = await payload.find({
        collection: 'enrollments',
        where: {
          user: { equals: userId },
          course: { equals: id },
        },
        limit: 1,
      });

      if (enrollments.docs.length > 0) {
        enrollment = enrollments.docs[0];

        // Get progress
        const progressRecords = await payload.find({
          collection: 'course-progress',
          where: {
            user: { equals: userId },
            course: { equals: id },
          },
          limit: 1,
        });

        if (progressRecords.docs.length > 0) {
          progress = progressRecords.docs[0];
        }
      }
    }

    // Get modules with lessons
    const modules = await payload.find({
      collection: 'modules',
      where: { course: { equals: id } },
      sort: 'order',
      depth: 0,
    });

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.docs.map(async (module) => {
        const lessons = await payload.find({
          collection: 'lessons',
          where: { module: { equals: module.id } },
          sort: 'order',
          depth: 0,
        });

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          order: module.order,
          lessons: lessons.docs.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            order: lesson.order,
            isFree: lesson.isFree,
          })),
        };
      })
    );

    // Transform for mobile
    const mobileCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail
        ? { url: (course.thumbnail as { url: string }).url }
        : null,
      pricing: {
        amount: (course.pricing as Record<string, unknown>)?.amount || 0,
        currency: (course.pricing as Record<string, unknown>)?.currency || 'USD',
        isFree: (course.pricing as Record<string, unknown>)?.isFree || false,
      },
      stats: {
        enrollments: (course.stats as Record<string, unknown>)?.enrollments || 0,
        avgRating: (course.stats as Record<string, unknown>)?.avgRating || 0,
        reviewCount: (course.stats as Record<string, unknown>)?.reviewCount || 0,
        totalDuration: (course.stats as Record<string, unknown>)?.totalDuration || 0,
        lessonCount: (course.stats as Record<string, unknown>)?.lessonCount || 0,
        moduleCount: modules.totalDocs,
      },
      instructor: course.instructor
        ? {
            id: typeof course.instructor === 'object' ? course.instructor.id : course.instructor,
            name: typeof course.instructor === 'object' ? (course.instructor as { name?: string }).name : undefined,
            avatar: typeof course.instructor === 'object'
              ? (course.instructor as { avatar?: { url: string } }).avatar?.url
              : undefined,
          }
        : null,
      level: course.level,
      category: course.category,
      language: course.language,
      modules: modulesWithLessons,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            status: enrollment.status,
            enrolledAt: enrollment.createdAt,
          }
        : null,
      progress: progress
        ? {
            completedLessons: (progress.completedLessons as string[])?.length || 0,
            totalLessons: (course.stats as Record<string, unknown>)?.lessonCount || 0,
            percentComplete: progress.percentComplete || 0,
            lastAccessedAt: progress.lastAccessedAt,
            lastLessonId: progress.lastLesson,
          }
        : null,
      isEnrolled: !!enrollment,
    };

    return NextResponse.json({ course: mobileCourse });
  } catch (error) {
    console.error('Mobile course detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

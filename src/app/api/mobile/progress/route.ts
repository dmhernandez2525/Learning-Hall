import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { z } from 'zod';

const progressUpdateSchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  watchTime: z.number().optional(),
  lastPosition: z.number().optional(),
  completed: z.boolean().optional(),
});

// Get user's learning progress across all courses
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Build query
    const where: Record<string, unknown> = {
      user: { equals: userId },
    };

    if (courseId) {
      where.course = { equals: courseId };
    }

    const progressRecords = await payload.find({
      collection: 'course-progress',
      where,
      depth: 1,
      limit: 100,
    });

    // Get active enrollments
    const enrollments = await payload.find({
      collection: 'enrollments',
      where: {
        user: { equals: userId },
        status: { equals: 'active' },
      },
      depth: 1,
    });

    // Calculate overall stats
    let totalWatchTime = 0;
    let totalCompletedLessons = 0;
    const totalCourses = enrollments.docs.length;
    let completedCourses = 0;

    const courseProgress = progressRecords.docs.map((progress) => {
      const completedLessons = (progress.completedLessons as string[]) || [];
      totalCompletedLessons += completedLessons.length;
      totalWatchTime += (progress.totalWatchTime as number) || 0;

      if ((progress.percentComplete as number) >= 100) {
        completedCourses++;
      }

      const course = progress.course;
      return {
        courseId: typeof course === 'object' ? course.id : course,
        courseName: typeof course === 'object' ? (course as { title?: string }).title : undefined,
        completedLessons: completedLessons.length,
        percentComplete: progress.percentComplete || 0,
        totalWatchTime: progress.totalWatchTime || 0,
        lastAccessedAt: progress.lastAccessedAt,
        lastLessonId: progress.lastLesson,
        streak: progress.streak || 0,
      };
    });

    return NextResponse.json({
      overview: {
        totalCourses,
        completedCourses,
        inProgressCourses: totalCourses - completedCourses,
        totalCompletedLessons,
        totalWatchTime,
      },
      courses: courseProgress,
    });
  } catch (error) {
    console.error('Mobile progress GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// Update progress for a lesson
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });
    const body = await request.json();

    const parsed = progressUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid progress data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lessonId, courseId, watchTime, lastPosition, completed } = parsed.data;

    // Verify enrollment
    const enrollments = await payload.find({
      collection: 'enrollments',
      where: {
        user: { equals: userId },
        course: { equals: courseId },
        status: { equals: 'active' },
      },
      limit: 1,
    });

    if (enrollments.docs.length === 0) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Update or create lesson activity
    const existingActivity = await payload.find({
      collection: 'lesson-activity',
      where: {
        user: { equals: userId },
        lesson: { equals: lessonId },
      },
      limit: 1,
    });

    let activity;
    const now = new Date().toISOString();

    if (existingActivity.docs.length > 0) {
      const existing = existingActivity.docs[0];
      activity = await payload.update({
        collection: 'lesson-activity',
        id: existing.id,
        data: {
          watchTime: watchTime !== undefined
            ? ((existing.watchTime as number) || 0) + watchTime
            : existing.watchTime,
          lastPosition: lastPosition ?? existing.lastPosition,
          completed: completed ?? existing.completed,
          completedAt: completed && !existing.completed ? now : existing.completedAt,
          lastAccessedAt: now,
        },
      });
    } else {
      activity = await payload.create({
        collection: 'lesson-activity',
        data: {
          user: userId,
          lesson: lessonId,
          watchTime: watchTime || 0,
          lastPosition: lastPosition || 0,
          completed: completed || false,
          completedAt: completed ? now : undefined,
          lastAccessedAt: now,
        },
      });
    }

    // Update course progress
    const existingProgress = await payload.find({
      collection: 'course-progress',
      where: {
        user: { equals: userId },
        course: { equals: courseId },
      },
      limit: 1,
    });

    // Get all completed lessons for this course
    const completedActivities = await payload.find({
      collection: 'lesson-activity',
      where: {
        user: { equals: userId },
        completed: { equals: true },
      },
      depth: 1,
    });

    // Filter to only lessons in this course
    const course = await payload.findByID({
      collection: 'courses',
      id: courseId,
    });

    const totalLessons = (course?.stats as Record<string, unknown>)?.lessonCount as number || 0;
    const completedLessonIds = completedActivities.docs
      .filter((a) => {
        const lesson = a.lesson;
        if (typeof lesson !== 'object') return false;
        const lessonModule = (lesson as { module?: { course?: string | { id: string } } }).module;
        if (typeof lessonModule !== 'object') return false;
        const lessonCourseId = typeof lessonModule.course === 'object' ? lessonModule.course.id : lessonModule.course;
        return lessonCourseId === courseId;
      })
      .map((a) => (typeof a.lesson === 'object' ? a.lesson.id : a.lesson));

    const percentComplete = totalLessons > 0
      ? Math.round((completedLessonIds.length / totalLessons) * 100)
      : 0;

    if (existingProgress.docs.length > 0) {
      await payload.update({
        collection: 'course-progress',
        id: existingProgress.docs[0].id,
        data: {
          completedLessons: completedLessonIds,
          percentComplete,
          lastLesson: lessonId,
          lastAccessedAt: now,
          totalWatchTime: ((existingProgress.docs[0].totalWatchTime as number) || 0) + (watchTime || 0),
        },
      });
    } else {
      await payload.create({
        collection: 'course-progress',
        data: {
          user: userId,
          course: courseId,
          completedLessons: completedLessonIds,
          percentComplete,
          lastLesson: lessonId,
          lastAccessedAt: now,
          totalWatchTime: watchTime || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        completed: activity.completed,
        watchTime: activity.watchTime,
        lastPosition: activity.lastPosition,
      },
      progress: {
        completedLessons: completedLessonIds.length,
        totalLessons,
        percentComplete,
      },
    });
  } catch (error) {
    console.error('Mobile progress POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

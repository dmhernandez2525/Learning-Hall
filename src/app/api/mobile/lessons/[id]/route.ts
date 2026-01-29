import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Mobile-optimized lesson detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config });
    const userId = request.headers.get('X-User-Id');

    const lesson = await payload.findByID({
      collection: 'lessons',
      id,
      depth: 2,
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get the module and course
    const moduleData = typeof lesson.module === 'object' ? lesson.module : null;
    const courseId = moduleData
      ? typeof moduleData.course === 'object'
        ? moduleData.course.id
        : moduleData.course
      : null;

    // Check if user has access
    let hasAccess = lesson.isFree;

    if (!hasAccess && userId && courseId) {
      const enrollments = await payload.find({
        collection: 'enrollments',
        where: {
          user: { equals: userId },
          course: { equals: courseId },
          status: { equals: 'active' },
        },
        limit: 1,
      });
      hasAccess = enrollments.docs.length > 0;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please enroll in the course.' },
        { status: 403 }
      );
    }

    // Get lesson activity if user is authenticated
    let activity = null;
    if (userId) {
      const activities = await payload.find({
        collection: 'lesson-activity',
        where: {
          user: { equals: userId },
          lesson: { equals: id },
        },
        limit: 1,
      });
      if (activities.docs.length > 0) {
        activity = activities.docs[0];
      }
    }

    // Get user's notes for this lesson
    let notes: Array<{ id: string; content: string; timestamp?: number; createdAt: string }> = [];
    if (userId) {
      const userNotes = await payload.find({
        collection: 'lesson-notes',
        where: {
          user: { equals: userId },
          lesson: { equals: id },
        },
        sort: '-createdAt',
        limit: 100,
      });
      notes = userNotes.docs.map((note) => ({
        id: note.id,
        content: note.content as string,
        timestamp: note.timestamp as number | undefined,
        createdAt: note.createdAt,
      }));
    }

    // Get next and previous lessons
    const moduleLessons = await payload.find({
      collection: 'lessons',
      where: { module: { equals: moduleData?.id } },
      sort: 'order',
    });

    const currentIndex = moduleLessons.docs.findIndex((l) => l.id === id);
    const prevLesson = currentIndex > 0 ? moduleLessons.docs[currentIndex - 1] : null;
    const nextLesson = currentIndex < moduleLessons.docs.length - 1 ? moduleLessons.docs[currentIndex + 1] : null;

    // Transform for mobile
    const mobileLesson = {
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      order: lesson.order,
      content: lesson.content,
      video: lesson.video
        ? {
            url: typeof lesson.video === 'object' ? (lesson.video as { url: string }).url : null,
            duration: typeof lesson.video === 'object' ? (lesson.video as { duration?: number }).duration : null,
          }
        : null,
      resources: lesson.resources || [],
      module: moduleData
        ? {
            id: moduleData.id,
            title: moduleData.title,
          }
        : null,
      courseId,
      activity: activity
        ? {
            completed: activity.completed,
            watchTime: activity.watchTime,
            lastPosition: activity.lastPosition,
            completedAt: activity.completedAt,
          }
        : null,
      notes,
      navigation: {
        prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
        next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
      },
    };

    return NextResponse.json({ lesson: mobileLesson });
  } catch (error) {
    console.error('Mobile lesson detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

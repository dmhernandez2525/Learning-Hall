import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { getLesson } from '@/lib/lessons';
import { getLessonVideoAnalytics } from '@/lib/video-analytics';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const lesson = await getLesson(lessonId);
    if (!lesson?.module?.course?.id) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const course = await getCourse(lesson.module.course.id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const duration = lesson.content.videoDuration ?? 0;
    const analytics = await getLessonVideoAnalytics(lessonId, duration);
    return NextResponse.json({ doc: analytics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load analytics' },
      { status: 400 }
    );
  }
}

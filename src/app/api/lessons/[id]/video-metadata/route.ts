import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { requireCourseAccess } from '@/lib/courses/access';
import { getLesson } from '@/lib/lessons';
import {
  getVideoMetadataByLesson,
  upsertVideoMetadata,
} from '@/lib/video-metadata';

type RouteParams = { params: Promise<{ id: string }> };

const chapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  timestamp: z.number().min(0),
});

const hotspotSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
  resourceUrl: z.string().min(1),
});

const annotationSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  timestamp: z.number().min(0),
  duration: z.number().min(1).max(60),
});

const qualitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().min(1),
  mimeType: z.string().optional(),
});

const patchSchema = z.object({
  chapters: z.array(chapterSchema).optional(),
  hotspots: z.array(hotspotSchema).optional(),
  annotations: z.array(annotationSchema).optional(),
  transcriptVtt: z.string().optional(),
  qualityOptions: z.array(qualitySchema).optional(),
});

function emptyMetadata(lessonId: string, courseId: string) {
  return {
    id: 'virtual',
    lessonId,
    courseId,
    chapters: [],
    hotspots: [],
    annotations: [],
    transcriptVtt: '',
    qualityOptions: [],
    updatedAt: new Date().toISOString(),
  };
}

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

    await requireCourseAccess(lesson.module.course.id, user);
    const metadata = await getVideoMetadataByLesson(lessonId);

    return NextResponse.json({
      doc: metadata ?? emptyMetadata(lessonId, lesson.module.course.id),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load video metadata' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const doc = await upsertVideoMetadata(lessonId, parsed.data, user);
    return NextResponse.json({ doc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update metadata' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { z } from 'zod';
import config from '@/payload.config';
import { getSession } from '@/lib/auth';
import { getCourse } from '@/lib/courses';
import { getModulesByCourse } from '@/lib/modules';
import { getLessonsByModule } from '@/lib/lessons';
import { buildCourseTemplateStructure, type BuilderModule } from '@/lib/course-builder-v2';

type RouteParams = { params: Promise<{ id: string }> };

const requestSchema = z.object({
  name: z.string().min(3, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
});

function toContentText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return '';
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const course = await getCourse(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && course.instructor.id !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this course' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const modules = await getModulesByCourse(id);
    const builderModules: BuilderModule[] = await Promise.all(
      modules.map(async (courseModule) => {
        const lessons = await getLessonsByModule(courseModule.id);
        return {
          id: courseModule.id,
          title: courseModule.title,
          description: courseModule.description,
          position: courseModule.position,
          lessons: lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            position: lesson.position,
            contentType: lesson.contentType,
            isPreview: lesson.isPreview,
            contentText: toContentText(lesson.content.textContent),
          })),
        };
      })
    );

    const structurePayload = buildCourseTemplateStructure(builderModules);
    const payload = await getPayload({ config });

    const template = await payload.create({
      collection: 'course-templates',
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category ?? 'general',
        structure: structurePayload.structure,
        estimatedDuration: {
          hours: structurePayload.estimatedHours,
        },
        createdBy: user.id,
        tenant: user.tenant,
        status: 'published',
        isPublic: Boolean(parsed.data.isPublic && user.role === 'admin'),
      },
    });

    return NextResponse.json(
      {
        templateId: String(template.id),
        templateName: parsed.data.name,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create course template' }, { status: 500 });
  }
}


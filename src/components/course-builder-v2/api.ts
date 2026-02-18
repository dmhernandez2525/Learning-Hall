import type { BuilderCourse, BuilderLesson, BuilderModule } from '@/lib/course-builder-v2';
import { toLessonOrderPayload, toModuleOrderPayload } from '@/lib/course-builder-v2';

interface ApiCourseResponse {
  doc: { id: string; title: string; status?: 'draft' | 'published' | 'archived' };
}

interface ApiModulesResponse {
  docs: Array<{
    id: string;
    title: string;
    description?: string;
    position: number;
    lessons?: Array<{
      id: string;
      title: string;
      position: number;
      contentType: BuilderLesson['contentType'];
      isPreview?: boolean;
      content?: { textContent?: unknown };
    }>;
  }>;
}

export async function fetchCourseBuilderData(
  courseId: string
): Promise<{ course: BuilderCourse; modules: BuilderModule[] }> {
  const [courseResponse, modulesResponse] = await Promise.all([
    fetch(`/api/courses/${courseId}`),
    fetch(`/api/modules?courseId=${courseId}`),
  ]);

  if (!courseResponse.ok) {
    throw new Error('Course not found');
  }
  if (!modulesResponse.ok) {
    throw new Error('Failed to load modules');
  }

  const courseData = (await courseResponse.json()) as ApiCourseResponse;
  const modulesData = (await modulesResponse.json()) as ApiModulesResponse;

  return {
    course: {
      id: String(courseData.doc.id),
      title: courseData.doc.title,
      status: courseData.doc.status ?? 'draft',
    },
    modules: modulesData.docs
      .sort((left, right) => left.position - right.position)
      .map((courseModule) => ({
        id: String(courseModule.id),
        title: courseModule.title,
        description: courseModule.description,
        position: courseModule.position,
        collapsed: false,
        lessons: (courseModule.lessons ?? [])
          .sort((left, right) => left.position - right.position)
          .map((lesson) => ({
            id: String(lesson.id),
            title: lesson.title,
            position: lesson.position,
            contentType: lesson.contentType,
            isPreview: Boolean(lesson.isPreview),
            contentText: lesson.content?.textContent
              ? String(lesson.content.textContent)
              : undefined,
          })),
      })),
  };
}

export async function saveLesson(lesson: BuilderLesson): Promise<void> {
  const response = await fetch(`/api/lessons/${lesson.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: lesson.title,
      contentType: lesson.contentType,
      isPreview: lesson.isPreview,
      content: {
        textContent: lesson.contentText ?? '',
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save lesson');
  }
}

export async function createLessonFromTemplate(
  moduleId: string,
  template: { label: string; contentType: BuilderLesson['contentType']; defaultContentText: string }
): Promise<{ lessonId: string }> {
  const response = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      moduleId,
      title: template.label,
      contentType: template.contentType,
      content: {
        textContent: template.defaultContentText,
      },
      isPreview: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create lesson from template');
  }

  const data = (await response.json()) as { doc: { id: string | number } };
  return { lessonId: String(data.doc.id) };
}

export async function reorderModulesOnServer(
  courseId: string,
  modules: BuilderModule[]
): Promise<void> {
  const response = await fetch('/api/modules/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId,
      moduleOrder: toModuleOrderPayload(modules),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to reorder modules');
  }
}

export async function reorderLessonsOnServer(
  moduleId: string,
  lessons: BuilderLesson[]
): Promise<void> {
  const response = await fetch('/api/lessons/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      moduleId,
      lessonOrder: toLessonOrderPayload(lessons),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to reorder lessons');
  }
}

export async function moveLessonToModule(lessonId: string, moduleId: string): Promise<void> {
  const response = await fetch('/api/lessons/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lessonId,
      newModuleId: moduleId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to move lesson');
  }
}

export async function copyLessonToModule(lesson: BuilderLesson, moduleId: string): Promise<void> {
  const response = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      moduleId,
      title: `${lesson.title} Copy`,
      contentType: lesson.contentType,
      content: {
        textContent: lesson.contentText ?? '',
      },
      isPreview: lesson.isPreview,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to copy lesson');
  }
}

export async function deleteLessonById(lessonId: string): Promise<void> {
  const response = await fetch(`/api/lessons/${lessonId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete lesson');
  }
}

export async function saveCourseStructureTemplate(
  courseId: string,
  payload: { name: string; description?: string }
): Promise<{ templateId: string }> {
  const response = await fetch(`/api/courses/${courseId}/template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to save course template');
  }

  const data = (await response.json()) as { templateId: string };
  return data;
}

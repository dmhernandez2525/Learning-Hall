import type { BuilderLesson, BuilderModule } from '@/lib/course-builder-v2';

export function withModuleUpdate(
  modules: BuilderModule[],
  moduleId: string,
  updater: (courseModule: BuilderModule) => BuilderModule
): BuilderModule[] {
  return modules.map((courseModule) =>
    courseModule.id === moduleId ? updater(courseModule) : courseModule
  );
}

export function withLessonUpdate(
  modules: BuilderModule[],
  lessonId: string,
  updater: (lesson: BuilderLesson) => BuilderLesson
): BuilderModule[] {
  return modules.map((courseModule) => ({
    ...courseModule,
    lessons: courseModule.lessons.map((lesson) =>
      lesson.id === lessonId ? updater(lesson) : lesson
    ),
  }));
}

export function findLesson(modules: BuilderModule[], lessonId: string): BuilderLesson | null {
  for (const courseModule of modules) {
    const lesson = courseModule.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return lesson;
    }
  }

  return null;
}

export function findModuleIdByLessonId(modules: BuilderModule[], lessonId: string): string | null {
  for (const courseModule of modules) {
    if (courseModule.lessons.some((lesson) => lesson.id === lessonId)) {
      return courseModule.id;
    }
  }

  return null;
}

export function removeLessons(modules: BuilderModule[], lessonIds: Set<string>): BuilderModule[] {
  return modules.map((courseModule) => ({
    ...courseModule,
    lessons: courseModule.lessons
      .filter((lesson) => !lessonIds.has(lesson.id))
      .map((lesson, index) => ({ ...lesson, position: index })),
  }));
}


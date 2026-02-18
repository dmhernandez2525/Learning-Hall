import { arrayMove } from '@dnd-kit/sortable';
import type { BuilderLesson, BuilderModule } from './types';

export interface ModuleOrderItem {
  id: string;
  position: number;
}

export interface LessonOrderItem {
  id: string;
  position: number;
}

function applyModulePositions(modules: BuilderModule[]): BuilderModule[] {
  return modules.map((courseModule, index) => ({
    ...courseModule,
    position: index,
  }));
}

function applyLessonPositions(lessons: BuilderLesson[]): BuilderLesson[] {
  return lessons.map((lesson, index) => ({
    ...lesson,
    position: index,
  }));
}

export function reorderModules(
  modules: BuilderModule[],
  activeId: string,
  overId: string
): BuilderModule[] {
  const oldIndex = modules.findIndex((courseModule) => courseModule.id === activeId);
  const newIndex = modules.findIndex((courseModule) => courseModule.id === overId);

  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
    return modules;
  }

  return applyModulePositions(arrayMove(modules, oldIndex, newIndex));
}

export function reorderLessons(
  modules: BuilderModule[],
  moduleId: string,
  activeLessonId: string,
  overLessonId: string
): BuilderModule[] {
  return modules.map((courseModule) => {
    if (courseModule.id !== moduleId) {
      return courseModule;
    }

    const oldIndex = courseModule.lessons.findIndex((lesson) => lesson.id === activeLessonId);
    const newIndex = courseModule.lessons.findIndex((lesson) => lesson.id === overLessonId);

    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
      return courseModule;
    }

    return {
      ...courseModule,
      lessons: applyLessonPositions(arrayMove(courseModule.lessons, oldIndex, newIndex)),
    };
  });
}

export function toModuleOrderPayload(modules: BuilderModule[]): ModuleOrderItem[] {
  return modules.map((courseModule, position) => ({
    id: courseModule.id,
    position,
  }));
}

export function toLessonOrderPayload(lessons: BuilderLesson[]): LessonOrderItem[] {
  return lessons.map((lesson, position) => ({
    id: lesson.id,
    position,
  }));
}


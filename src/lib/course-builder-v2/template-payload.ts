import type { BuilderModule } from './types';

interface CourseTemplateLesson {
  title: string;
  type: string;
  estimatedDuration: number;
  instructions: string;
}

interface CourseTemplateModule {
  moduleTitle: string;
  moduleDescription: string;
  hasQuiz: boolean;
  lessons: CourseTemplateLesson[];
}

export interface CourseTemplateStructure {
  structure: CourseTemplateModule[];
  estimatedHours: number;
}

function estimateLessonDuration(type: string): number {
  const durationMap: Record<string, number> = {
    video: 12,
    text: 8,
    quiz: 6,
    assignment: 18,
  };

  return durationMap[type] ?? 10;
}

export function buildCourseTemplateStructure(modules: BuilderModule[]): CourseTemplateStructure {
  const structure = modules.map((courseModule) => {
    const lessons = courseModule.lessons.map((lesson) => ({
      title: lesson.title,
      type: lesson.contentType,
      estimatedDuration: estimateLessonDuration(lesson.contentType),
      instructions: lesson.contentText?.slice(0, 160) ?? '',
    }));

    return {
      moduleTitle: courseModule.title,
      moduleDescription: courseModule.description ?? '',
      hasQuiz: lessons.some((lesson) => lesson.type === 'quiz'),
      lessons,
    };
  });

  const totalMinutes = structure.reduce(
    (sum, courseModule) =>
      sum + courseModule.lessons.reduce((moduleSum, lesson) => moduleSum + lesson.estimatedDuration, 0),
    0
  );

  return {
    structure,
    estimatedHours: Math.max(1, Math.round(totalMinutes / 60)),
  };
}


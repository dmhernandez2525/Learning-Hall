import type { BuilderModule, BuilderPublishWarning } from './types';

function normalizeContent(text?: string): string {
  return (text ?? '').trim();
}

export function validatePublishReadiness(modules: BuilderModule[]): BuilderPublishWarning[] {
  const warnings: BuilderPublishWarning[] = [];

  if (modules.length === 0) {
    warnings.push({
      id: 'no-modules',
      message: 'Add at least one module before publishing this course.',
      severity: 'error',
    });
    return warnings;
  }

  const hasQuizLesson = modules.some((courseModule) =>
    courseModule.lessons.some((lesson) => lesson.contentType === 'quiz')
  );

  if (!hasQuizLesson) {
    warnings.push({
      id: 'no-quiz-lesson',
      message: 'Consider adding at least one quiz lesson for measurable assessment.',
      severity: 'warning',
    });
  }

  modules.forEach((courseModule) => {
    if (courseModule.lessons.length === 0) {
      warnings.push({
        id: `empty-module-${courseModule.id}`,
        message: `Module "${courseModule.title}" has no lessons.`,
        severity: 'error',
      });
    }

    courseModule.lessons.forEach((lesson) => {
      if (lesson.contentType === 'text' && normalizeContent(lesson.contentText).length === 0) {
        warnings.push({
          id: `missing-content-${lesson.id}`,
          message: `Text lesson "${lesson.title}" is missing lesson content.`,
          severity: 'warning',
        });
      }
    });
  });

  return warnings;
}


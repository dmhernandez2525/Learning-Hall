import { describe, expect, it } from 'vitest';
import { buildCourseTemplateStructure, type BuilderModule } from '@/lib/course-builder-v2';

describe('course-builder-v2 template payload', () => {
  it('builds module and lesson template structure with estimated hours', () => {
    const modules: BuilderModule[] = [
      {
        id: 'module-1',
        title: 'Foundations',
        description: 'Start here',
        position: 0,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Intro',
            position: 0,
            contentType: 'video',
            isPreview: true,
            contentText: 'Short introduction',
          },
          {
            id: 'lesson-2',
            title: 'Knowledge Check',
            position: 1,
            contentType: 'quiz',
            isPreview: false,
            contentText: 'Question bank',
          },
        ],
      },
    ];

    const payload = buildCourseTemplateStructure(modules);

    expect(payload.structure).toHaveLength(1);
    expect(payload.structure[0].moduleTitle).toBe('Foundations');
    expect(payload.structure[0].hasQuiz).toBe(true);
    expect(payload.structure[0].lessons[0].estimatedDuration).toBe(12);
    expect(payload.estimatedHours).toBe(1);
  });
});

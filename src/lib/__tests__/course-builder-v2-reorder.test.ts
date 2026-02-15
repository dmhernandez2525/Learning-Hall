import { describe, expect, it } from 'vitest';
import { reorderLessons, reorderModules, type BuilderModule } from '@/lib/course-builder-v2';

const sampleModules: BuilderModule[] = [
  {
    id: 'module-a',
    title: 'Module A',
    position: 0,
    lessons: [
      { id: 'lesson-a1', title: 'Lesson A1', position: 0, contentType: 'text', isPreview: false },
      { id: 'lesson-a2', title: 'Lesson A2', position: 1, contentType: 'quiz', isPreview: false },
    ],
  },
  {
    id: 'module-b',
    title: 'Module B',
    position: 1,
    lessons: [
      { id: 'lesson-b1', title: 'Lesson B1', position: 0, contentType: 'video', isPreview: true },
    ],
  },
];

describe('course-builder-v2 reorder helpers', () => {
  it('reorders modules and recalculates positions', () => {
    const reordered = reorderModules(sampleModules, 'module-b', 'module-a');

    expect(reordered.map((courseModule) => courseModule.id)).toEqual(['module-b', 'module-a']);
    expect(reordered.map((courseModule) => courseModule.position)).toEqual([0, 1]);
  });

  it('reorders lessons inside a module and recalculates lesson positions', () => {
    const reordered = reorderLessons(sampleModules, 'module-a', 'lesson-a2', 'lesson-a1');
    const moduleA = reordered.find((courseModule) => courseModule.id === 'module-a');

    expect(moduleA?.lessons.map((lesson) => lesson.id)).toEqual(['lesson-a2', 'lesson-a1']);
    expect(moduleA?.lessons.map((lesson) => lesson.position)).toEqual([0, 1]);
  });
});

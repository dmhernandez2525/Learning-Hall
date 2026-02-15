import { describe, expect, it } from 'vitest';
import {
  createHistoryState,
  pushHistory,
  redoHistory,
  undoHistory,
  type BuilderSnapshot,
} from '@/lib/course-builder-v2';

const initialSnapshot: BuilderSnapshot = {
  selectedLessonId: 'lesson-1',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1',
      position: 0,
      lessons: [{ id: 'lesson-1', title: 'Lesson 1', position: 0, contentType: 'text', isPreview: false }],
    },
  ],
};

describe('course-builder-v2 history stack', () => {
  it('tracks undo and redo transitions', () => {
    const state = createHistoryState(initialSnapshot);
    const changedSnapshot: BuilderSnapshot = {
      ...initialSnapshot,
      selectedLessonId: 'lesson-2',
      modules: [
        {
          ...initialSnapshot.modules[0],
          lessons: [
            ...initialSnapshot.modules[0].lessons,
            { id: 'lesson-2', title: 'Lesson 2', position: 1, contentType: 'quiz', isPreview: false },
          ],
        },
      ],
    };

    const pushed = pushHistory(state, changedSnapshot);
    expect(pushed.past).toHaveLength(1);
    expect(pushed.present.selectedLessonId).toBe('lesson-2');

    const undone = undoHistory(pushed);
    expect(undone.present.selectedLessonId).toBe('lesson-1');
    expect(undone.future).toHaveLength(1);

    const redone = redoHistory(undone);
    expect(redone.present.selectedLessonId).toBe('lesson-2');
    expect(redone.past).toHaveLength(1);
  });
});

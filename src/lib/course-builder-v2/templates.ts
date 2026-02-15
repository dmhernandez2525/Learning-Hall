import type { BuilderTemplate } from './types';

export const LESSON_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'video-lesson-template',
    label: 'Video Lesson',
    description: 'Video intro, supporting notes, and recap prompt.',
    contentType: 'video',
    defaultContentText:
      '## Video Lesson Outline\n\n- Introduce topic\n- Walk through examples\n- Add recap prompts',
  },
  {
    id: 'text-lesson-template',
    label: 'Text Lesson',
    description: 'Concept explanation with examples and summary.',
    contentType: 'text',
    defaultContentText:
      '## Text Lesson Outline\n\n1. Learning goal\n2. Core concept\n3. Example walkthrough\n4. Summary',
  },
  {
    id: 'quiz-lesson-template',
    label: 'Quiz Lesson',
    description: 'Quick check template with question prompts.',
    contentType: 'quiz',
    defaultContentText:
      '## Quiz Starter\n\n- Question 1\n- Question 2\n- Reflection prompt',
  },
];

export function getTemplateById(templateId: string): BuilderTemplate | null {
  return LESSON_TEMPLATES.find((template) => template.id === templateId) ?? null;
}


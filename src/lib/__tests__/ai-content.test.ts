import { describe, it, expect } from 'vitest';
import { formatSuggestion, formatQuiz, formatSummary } from '../ai-content';

describe('formatSuggestion', () => {
  it('maps a full suggestion document', () => {
    const doc: Record<string, unknown> = {
      id: 's-1',
      course: 'course-1',
      lesson: 'lesson-1',
      type: 'example',
      title: 'Real-world Example',
      content: 'Here is an example of...',
      status: 'pending',
      createdBy: 'user-1',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatSuggestion(doc);
    expect(result.id).toBe('s-1');
    expect(result.courseId).toBe('course-1');
    expect(result.type).toBe('example');
    expect(result.title).toBe('Real-world Example');
    expect(result.status).toBe('pending');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 's-2',
      course: { id: 'c-2', title: 'Course' },
      lesson: { id: 'l-2', title: 'Lesson' },
      createdBy: { id: 'u-2', name: 'Alice' },
      createdAt: '2026-02-01T00:00:00Z',
    };
    const result = formatSuggestion(doc);
    expect(result.courseId).toBe('c-2');
    expect(result.lessonId).toBe('l-2');
    expect(result.createdBy).toBe('u-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 's-3' };
    const result = formatSuggestion(doc);
    expect(result.title).toBe('');
    expect(result.content).toBe('');
    expect(result.type).toBe('topic');
    expect(result.status).toBe('pending');
  });
});

describe('formatQuiz', () => {
  it('maps a full quiz document', () => {
    const doc: Record<string, unknown> = {
      id: 'q-1',
      course: 'course-1',
      lesson: 'lesson-1',
      title: 'Chapter 1 Quiz',
      questions: [
        { question: 'What is X?', options: ['A', 'B'], correctIndex: 0, explanation: 'Because A' },
      ],
      difficulty: 'medium',
      status: 'draft',
      createdBy: 'user-1',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatQuiz(doc);
    expect(result.id).toBe('q-1');
    expect(result.title).toBe('Chapter 1 Quiz');
    expect(result.questions).toHaveLength(1);
    expect(result.difficulty).toBe('medium');
    expect(result.status).toBe('draft');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'q-2' };
    const result = formatQuiz(doc);
    expect(result.title).toBe('');
    expect(result.questions).toEqual([]);
    expect(result.difficulty).toBe('medium');
  });
});

describe('formatSummary', () => {
  it('maps a full summary document', () => {
    const doc: Record<string, unknown> = {
      id: 'sum-1',
      course: 'course-1',
      lesson: 'lesson-1',
      originalLength: 5000,
      summaryLength: 500,
      summary: 'This lesson covers...',
      keyPoints: ['Point 1', 'Point 2'],
      status: 'draft',
      createdBy: 'user-1',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = formatSummary(doc);
    expect(result.id).toBe('sum-1');
    expect(result.originalLength).toBe(5000);
    expect(result.summaryLength).toBe(500);
    expect(result.keyPoints).toEqual(['Point 1', 'Point 2']);
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'sum-2' };
    const result = formatSummary(doc);
    expect(result.originalLength).toBe(0);
    expect(result.summary).toBe('');
    expect(result.keyPoints).toEqual([]);
    expect(result.status).toBe('draft');
  });
});

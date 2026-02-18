import { describe, it, expect } from 'vitest';
import { formatMicroLesson, formatCard, formatChallenge } from '../microlearning';

describe('formatMicroLesson', () => {
  it('maps a full micro lesson document', () => {
    const doc: Record<string, unknown> = {
      id: 'ml-1',
      course: 'course-1',
      title: 'Intro to Variables',
      content: 'Variables store data...',
      durationMinutes: 5,
      order: 1,
      status: 'published',
    };

    const result = formatMicroLesson(doc);
    expect(result.id).toBe('ml-1');
    expect(result.courseId).toBe('course-1');
    expect(result.title).toBe('Intro to Variables');
    expect(result.durationMinutes).toBe(5);
    expect(result.order).toBe(1);
    expect(result.status).toBe('published');
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'ml-2',
      course: { id: 'c-2' },
    };
    const result = formatMicroLesson(doc);
    expect(result.courseId).toBe('c-2');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ml-3' };
    const result = formatMicroLesson(doc);
    expect(result.title).toBe('');
    expect(result.content).toBe('');
    expect(result.durationMinutes).toBe(0);
    expect(result.order).toBe(0);
    expect(result.status).toBe('draft');
  });
});

describe('formatCard', () => {
  it('maps a full card document', () => {
    const doc: Record<string, unknown> = {
      id: 'card-1',
      lesson: 'lesson-1',
      question: 'What is a variable?',
      answer: 'A named container for data',
      interval: 3,
      nextReviewAt: '2026-02-15T00:00:00Z',
      easeFactor: 2.5,
      repetitions: 4,
    };

    const result = formatCard(doc);
    expect(result.id).toBe('card-1');
    expect(result.lessonId).toBe('lesson-1');
    expect(result.question).toBe('What is a variable?');
    expect(result.interval).toBe(3);
    expect(result.easeFactor).toBe(2.5);
    expect(result.repetitions).toBe(4);
  });

  it('handles object references', () => {
    const doc: Record<string, unknown> = {
      id: 'card-2',
      lesson: { id: 'l-5' },
    };
    const result = formatCard(doc);
    expect(result.lessonId).toBe('l-5');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'card-3' };
    const result = formatCard(doc);
    expect(result.question).toBe('');
    expect(result.answer).toBe('');
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.5);
    expect(result.repetitions).toBe(0);
  });
});

describe('formatChallenge', () => {
  it('maps a full challenge document', () => {
    const doc: Record<string, unknown> = {
      id: 'ch-1',
      title: 'Morning Quiz',
      questions: [{ question: 'Q1', options: ['A', 'B'], correctIndex: 0 }],
      difficulty: 'medium',
      points: 10,
      activeDate: '2026-02-15',
      status: 'active',
    };

    const result = formatChallenge(doc);
    expect(result.id).toBe('ch-1');
    expect(result.title).toBe('Morning Quiz');
    expect(result.questions).toHaveLength(1);
    expect(result.difficulty).toBe('medium');
    expect(result.points).toBe(10);
    expect(result.status).toBe('active');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'ch-2' };
    const result = formatChallenge(doc);
    expect(result.title).toBe('');
    expect(result.questions).toEqual([]);
    expect(result.difficulty).toBe('easy');
    expect(result.points).toBe(0);
    expect(result.status).toBe('active');
  });
});

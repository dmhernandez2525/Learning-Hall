import { describe, it, expect } from 'vitest';
import { formatSkill, formatMapping, formatAssessment } from '../skills';

describe('formatSkill', () => {
  it('maps a full skill document', () => {
    const doc: Record<string, unknown> = {
      id: 'skill-1',
      name: 'TypeScript',
      description: 'Typed JavaScript',
      category: 'Programming',
      parent: null,
      level: 'intermediate',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatSkill(doc);
    expect(result.id).toBe('skill-1');
    expect(result.name).toBe('TypeScript');
    expect(result.category).toBe('Programming');
    expect(result.parentId).toBeNull();
    expect(result.level).toBe('intermediate');
    expect(result.status).toBe('active');
  });

  it('handles parent object reference', () => {
    const doc: Record<string, unknown> = {
      id: 'skill-2',
      name: 'React',
      category: 'Frontend',
      parent: { id: 'skill-1' },
      level: 'advanced',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatSkill(doc);
    expect(result.parentId).toBe('skill-1');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'skill-3' };
    const result = formatSkill(doc);
    expect(result.name).toBe('');
    expect(result.description).toBe('');
    expect(result.category).toBe('');
    expect(result.parentId).toBeNull();
    expect(result.level).toBe('beginner');
    expect(result.status).toBe('active');
  });
});

describe('formatMapping', () => {
  it('maps a full mapping document', () => {
    const doc: Record<string, unknown> = {
      id: 'map-1',
      skill: { id: 'skill-1', name: 'TypeScript' },
      course: { id: 'course-1', title: 'TS Fundamentals' },
      targetLevel: 'advanced',
      weight: 5,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatMapping(doc);
    expect(result.id).toBe('map-1');
    expect(result.skillId).toBe('skill-1');
    expect(result.skillName).toBe('TypeScript');
    expect(result.courseId).toBe('course-1');
    expect(result.courseName).toBe('TS Fundamentals');
    expect(result.targetLevel).toBe('advanced');
    expect(result.weight).toBe(5);
  });

  it('handles string references', () => {
    const doc: Record<string, unknown> = {
      id: 'map-2',
      skill: 'skill-2',
      course: 'course-2',
      targetLevel: 'beginner',
      weight: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const result = formatMapping(doc);
    expect(result.skillId).toBe('skill-2');
    expect(result.skillName).toBe('');
    expect(result.courseId).toBe('course-2');
    expect(result.courseName).toBe('');
  });
});

describe('formatAssessment', () => {
  it('maps a full assessment document', () => {
    const doc: Record<string, unknown> = {
      id: 'assess-1',
      user: { id: 'user-1', name: 'Alice' },
      skill: { id: 'skill-1', name: 'TypeScript' },
      currentLevel: 'beginner',
      targetLevel: 'advanced',
      assessedAt: '2026-02-01T00:00:00Z',
      source: 'course_completion',
    };

    const result = formatAssessment(doc);
    expect(result.id).toBe('assess-1');
    expect(result.userId).toBe('user-1');
    expect(result.userName).toBe('Alice');
    expect(result.skillId).toBe('skill-1');
    expect(result.skillName).toBe('TypeScript');
    expect(result.currentLevel).toBe('beginner');
    expect(result.targetLevel).toBe('advanced');
    expect(result.source).toBe('course_completion');
  });

  it('applies defaults for missing fields', () => {
    const doc: Record<string, unknown> = { id: 'assess-2' };
    const result = formatAssessment(doc);
    expect(result.currentLevel).toBe('beginner');
    expect(result.targetLevel).toBe('intermediate');
    expect(result.source).toBe('manual');
  });
});

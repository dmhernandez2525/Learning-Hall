import { describe, it, expect } from 'vitest';
import CourseReducer from './course_reducer';
import { RECEIVE_ALL_COURSES, RECEIVE_COURSE, DELETE_COURSE } from '../actions/course';
import type { Course } from '../types';

describe('CourseReducer', () => {
  const initialState = {};

  const mockCourse: Course = {
    id: 1,
    name: 'Test Course',
    author_id: 1
  };

  it('should return initial state', () => {
    const result = CourseReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(result).toEqual({});
  });

  it('should handle RECEIVE_ALL_COURSES', () => {
    const courses = {
      1: mockCourse,
      2: { ...mockCourse, id: 2, name: 'Course 2' }
    };

    const action = {
      type: RECEIVE_ALL_COURSES,
      courses
    };

    const result = CourseReducer(initialState, action);
    expect(result).toEqual(courses);
  });

  it('should handle RECEIVE_COURSE', () => {
    const action = {
      type: RECEIVE_COURSE,
      course: mockCourse
    };

    const result = CourseReducer(initialState, action);
    expect(result).toEqual({ 1: mockCourse });
  });

  it('should handle RECEIVE_COURSE for existing state', () => {
    const existingState = {
      1: mockCourse
    };

    const newCourse = { ...mockCourse, id: 2, name: 'New Course' };
    const action = {
      type: RECEIVE_COURSE,
      course: newCourse
    };

    const result = CourseReducer(existingState, action);
    expect(result).toEqual({
      1: mockCourse,
      2: newCourse
    });
  });

  it('should handle DELETE_COURSE', () => {
    const existingState = {
      1: mockCourse,
      2: { ...mockCourse, id: 2 }
    };

    const action = {
      type: DELETE_COURSE,
      courseId: 1
    };

    const result = CourseReducer(existingState, action);
    expect(result).toEqual({ 2: { ...mockCourse, id: 2 } });
    expect(result[1]).toBeUndefined();
  });

  it('should not mutate state', () => {
    const existingState = {
      1: mockCourse
    };

    const action = {
      type: RECEIVE_COURSE,
      course: { ...mockCourse, id: 2 }
    };

    const result = CourseReducer(existingState, action);
    expect(result).not.toBe(existingState);
    expect(existingState).toEqual({ 1: mockCourse });
  });
});

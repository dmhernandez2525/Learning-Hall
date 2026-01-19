import type { Course } from '../types';

// Action type constants
export const RECEIVE_PAIN = "RECEIVE_PAIN";
export const NEW_COURSE = "NEW_COURSE";

// Action interfaces
interface ReceivePainAction {
  type: typeof RECEIVE_PAIN;
  id: number | string;
}

interface NewCourseAction {
  type: typeof NEW_COURSE;
  CurrentCourse: Course;
}

export type SwitchActionTypes = ReceivePainAction | NewCourseAction;

// Action creators
export const updatePain = (id: number | string): ReceivePainAction => ({
  type: RECEIVE_PAIN,
  id
});

export const receiveCourse = (CurrentCourse: Course): NewCourseAction => ({
  type: NEW_COURSE,
  CurrentCourse
});

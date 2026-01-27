import type { Course } from '../types';
import {
  RECEIVE_ALL_COURSES,
  RECEIVE_COURSE,
  DELETE_COURSE,
  CourseActionTypes
} from '../actions/course';

type CourseState = Record<number, Course>;

const initialState: CourseState = {};

const CourseReducer = (
  state: CourseState = initialState,
  action: CourseActionTypes
): CourseState => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_ALL_COURSES:
      return action.courses;
    case RECEIVE_COURSE:
      return { ...state, [action.course.id]: action.course };
    case DELETE_COURSE: {
      const newState = { ...state };
      delete newState[action.courseId];
      return newState;
    }
    default:
      return state;
  }
};

export default CourseReducer;

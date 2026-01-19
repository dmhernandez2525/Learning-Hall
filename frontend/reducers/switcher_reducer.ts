import type { Course, PainState } from '../types';
import { RECEIVE_PAIN, NEW_COURSE, SwitchActionTypes } from '../actions/switch';
import { RECEIVE_SUBJECT, DELETE_SUBJECT, SubjectActionTypes } from '../actions/subject';
import { RECEIVE_COURSE, DELETE_COURSE, CourseActionTypes } from '../actions/course';
import { RECEIVE_TASK, DELETE_TASK, TaskActionTypes } from '../actions/task';
import { AnyAction } from 'redux';

const _nullPain: PainState = {
  currentPain: "no Pain",
  currentCourse: "no Course"
};

type SwitcherAction = SwitchActionTypes | SubjectActionTypes | CourseActionTypes | TaskActionTypes | AnyAction;

const SwitcherReducer = (
  state: PainState = _nullPain,
  action: SwitcherAction
): PainState => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_PAIN:
      return { ...state, currentPain: (action as { type: typeof RECEIVE_PAIN; id: string | number }).id };

    case NEW_COURSE:
      return { ...state, currentCourse: (action as { type: typeof NEW_COURSE; CurrentCourse: Course }).CurrentCourse };

    case RECEIVE_COURSE:
    case DELETE_COURSE:
    case RECEIVE_SUBJECT:
    case DELETE_SUBJECT:
    case RECEIVE_TASK:
    case DELETE_TASK:
      return { ...state, currentCourse: "no Course" };

    default:
      return state;
  }
};

export default SwitcherReducer;

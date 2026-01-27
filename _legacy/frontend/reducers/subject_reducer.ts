import type { Subject } from '../types';
import {
  RECEIVE_ALL_SUBJECTS,
  RECEIVE_SUBJECT,
  DELETE_SUBJECT,
  SubjectActionTypes
} from '../actions/subject';

type SubjectState = Record<number, Subject>;

const initialState: SubjectState = {};

const SubjectReducer = (
  state: SubjectState = initialState,
  action: SubjectActionTypes
): SubjectState => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_ALL_SUBJECTS:
      return action.subjects;
    case RECEIVE_SUBJECT:
      return { ...state, [action.subject.id]: action.subject };
    case DELETE_SUBJECT: {
      const newState = { ...state };
      delete newState[action.subjectId];
      return newState;
    }
    default:
      return state;
  }
};

export default SubjectReducer;

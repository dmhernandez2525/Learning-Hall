import type { Session, User } from '../types';
import {
  RECEIVE_CURRENT_USER,
  LOGOUT_CURRENT_USER,
  NEW_TASK,
  SessionActionTypes
} from '../actions/session';

const _nullSession: Session = {
  currentUser: null,
  currentTask: "no task"
};

const sessionReducer = (
  state: Session = _nullSession,
  action: SessionActionTypes
): Session => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_CURRENT_USER:
      return { ...state, currentUser: action.user };
    case NEW_TASK:
      return { ...state, currentTask: action.task };
    case LOGOUT_CURRENT_USER:
      return _nullSession;
    default:
      return state;
  }
};

export default sessionReducer;

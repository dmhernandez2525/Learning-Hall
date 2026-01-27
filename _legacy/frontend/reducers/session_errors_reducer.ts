import {
  RECEIVE_SESSION_ERRORS,
  RECEIVE_CURRENT_USER,
  CLEAR_SESSION_ERRORS,
  SessionActionTypes
} from '../actions/session';

type SessionErrorsState = string[];

const initialState: SessionErrorsState = [];

const sessionErrorsReducer = (
  state: SessionErrorsState = initialState,
  action: SessionActionTypes
): SessionErrorsState => {
  switch (action.type) {
    case RECEIVE_CURRENT_USER:
      return [];
    case RECEIVE_SESSION_ERRORS:
      return action.errors;
    case CLEAR_SESSION_ERRORS:
      return [];
    default:
      return state;
  }
};

export default sessionErrorsReducer;

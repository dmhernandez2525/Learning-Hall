import { Dispatch } from 'redux';
import type { User, SignInUser, SignUpUser, AppThunk, ApiError } from '../types';

// Declare jQuery global
declare const $: JQueryStatic;

// Action type constants
export const RECEIVE_CURRENT_USER = "RECEIVE_CURRENT_USER";
export const LOGOUT_CURRENT_USER = "LOGOUT_CURRENT_USER";
export const RECEIVE_SESSION_ERRORS = "RECEIVE_SESSION_ERRORS";
export const CLEAR_SESSION_ERRORS = "CLEAR_SESSION_ERRORS";
export const NEW_TASK = "NEW_TASK";

// Action interfaces
interface ReceiveCurrentUserAction {
  type: typeof RECEIVE_CURRENT_USER;
  user: User;
}

interface LogoutCurrentUserAction {
  type: typeof LOGOUT_CURRENT_USER;
  userId: number;
}

interface ReceiveSessionErrorsAction {
  type: typeof RECEIVE_SESSION_ERRORS;
  errors: string[];
}

interface ClearSessionErrorsAction {
  type: typeof CLEAR_SESSION_ERRORS;
}

interface NewTaskAction {
  type: typeof NEW_TASK;
  task: string;
}

export type SessionActionTypes =
  | ReceiveCurrentUserAction
  | LogoutCurrentUserAction
  | ReceiveSessionErrorsAction
  | ClearSessionErrorsAction
  | NewTaskAction;

// API functions
const APIuser = {
  signUp: (user: SignUpUser): JQuery.jqXHR<User> =>
    $.ajax({
      method: "POST",
      url: "/api/users",
      data: { user }
    }),

  logIn: (user: SignInUser): JQuery.jqXHR<User> =>
    $.ajax({
      method: "POST",
      url: "/api/sessions",
      data: { user }
    }),

  signOut: (): JQuery.jqXHR<number> =>
    $.ajax({
      method: "DELETE",
      url: "/api/sessions"
    })
};

// Action creators
export const receiveErrors = (errors: string[]): ReceiveSessionErrorsAction => ({
  type: RECEIVE_SESSION_ERRORS,
  errors
});

export const receiveTask = (task: string): NewTaskAction => ({
  type: NEW_TASK,
  task
});

export const clearErrors = (): ClearSessionErrorsAction => ({
  type: CLEAR_SESSION_ERRORS
});

// Thunk action creators
export const signUp = (user: SignUpUser): AppThunk<Promise<ReceiveCurrentUserAction | ReceiveSessionErrorsAction>> =>
  (dispatch: Dispatch) =>
    APIuser.signUp(user).then(
      (user) => dispatch({
        type: RECEIVE_CURRENT_USER,
        user
      }),
      (error: ApiError) => dispatch(receiveErrors(error.responseJSON || ['An error occurred']))
    );

export const signIn = (user: SignInUser): AppThunk<Promise<ReceiveCurrentUserAction | ReceiveSessionErrorsAction>> =>
  (dispatch: Dispatch) =>
    APIuser.logIn(user).then(
      (user) => dispatch({
        type: RECEIVE_CURRENT_USER,
        user
      }),
      (error: ApiError) => dispatch(receiveErrors(error.responseJSON || ['An error occurred']))
    );

export const signOut = (): AppThunk<Promise<LogoutCurrentUserAction>> =>
  (dispatch: Dispatch) =>
    APIuser.signOut().then((userId) =>
      dispatch({
        type: LOGOUT_CURRENT_USER,
        userId
      })
    );

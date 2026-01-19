import { describe, it, expect } from 'vitest';
import sessionReducer from './session_reducer';
import { RECEIVE_CURRENT_USER, LOGOUT_CURRENT_USER, NEW_TASK } from '../actions/session';
import type { User, Session } from '../types';

describe('sessionReducer', () => {
  const initialState: Session = {
    currentUser: null,
    currentTask: 'no task'
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  it('should return initial state', () => {
    const result = sessionReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(result).toEqual(initialState);
  });

  it('should handle RECEIVE_CURRENT_USER', () => {
    const action = {
      type: RECEIVE_CURRENT_USER,
      user: mockUser
    };

    const result = sessionReducer(initialState, action);
    expect(result.currentUser).toEqual(mockUser);
    expect(result.currentTask).toBe('no task');
  });

  it('should handle NEW_TASK', () => {
    const stateWithUser: Session = {
      currentUser: mockUser,
      currentTask: 'no task'
    };

    const action = {
      type: NEW_TASK,
      task: 'Profile'
    };

    const result = sessionReducer(stateWithUser, action);
    expect(result.currentTask).toBe('Profile');
    expect(result.currentUser).toEqual(mockUser);
  });

  it('should handle LOGOUT_CURRENT_USER', () => {
    const stateWithUser: Session = {
      currentUser: mockUser,
      currentTask: 'Profile'
    };

    const action = {
      type: LOGOUT_CURRENT_USER,
      userId: 1
    };

    const result = sessionReducer(stateWithUser, action);
    expect(result).toEqual(initialState);
  });

  it('should not mutate state', () => {
    const stateWithUser: Session = {
      currentUser: mockUser,
      currentTask: 'no task'
    };

    const action = {
      type: NEW_TASK,
      task: 'Profile'
    };

    const result = sessionReducer(stateWithUser, action);
    expect(result).not.toBe(stateWithUser);
    expect(stateWithUser.currentTask).toBe('no task');
  });
});

import type { Task } from '../types';
import {
  RECEIVE_ALL_TASKS,
  RECEIVE_TASK,
  DELETE_TASK,
  TaskActionTypes
} from '../actions/task';

type TaskState = Record<number, Task>;

const initialState: TaskState = {};

const TaskReducer = (
  state: TaskState = initialState,
  action: TaskActionTypes
): TaskState => {
  Object.freeze(state);

  switch (action.type) {
    case RECEIVE_ALL_TASKS:
      return action.tasks;
    case RECEIVE_TASK:
      return { ...state, [action.task.id]: action.task };
    case DELETE_TASK: {
      const newState = { ...state };
      delete newState[action.taskId];
      return newState;
    }
    default:
      return state;
  }
};

export default TaskReducer;

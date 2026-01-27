import { Dispatch } from 'redux';
import type { Task, AppThunk } from '../types';

// Declare jQuery global
declare const $: JQueryStatic;

// Action type constants
export const RECEIVE_ALL_TASKS = "RECEIVE_ALL_TASKS";
export const RECEIVE_TASK = "RECEIVE_TASK";
export const DELETE_TASK = "DELETE_TASK";

// Action interfaces
interface ReceiveAllTasksAction {
  type: typeof RECEIVE_ALL_TASKS;
  tasks: Record<number, Task>;
}

interface ReceiveTaskAction {
  type: typeof RECEIVE_TASK;
  task: Task;
}

interface DeleteTaskAction {
  type: typeof DELETE_TASK;
  taskId: number;
}

export type TaskActionTypes = ReceiveAllTasksAction | ReceiveTaskAction | DeleteTaskAction;

// API functions
const APItask = {
  allTasks: (): JQuery.jqXHR<Record<number, Task>> =>
    $.ajax({
      method: "GET",
      url: "/api/tasks"
    }),

  showTask: (id: number): JQuery.jqXHR<Task> =>
    $.ajax({
      method: "GET",
      url: `/api/tasks/${id}`
    }),

  newTask: (task: Partial<Task> & { subjectName?: string }): JQuery.jqXHR<Task> =>
    $.ajax({
      method: "POST",
      url: "/api/tasks",
      data: { task }
    }),

  updateTask: (task: Partial<Task>): JQuery.jqXHR<Task> =>
    $.ajax({
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      data: { task }
    }),

  deleteTask: (id: number): JQuery.jqXHR<number> =>
    $.ajax({
      method: "DELETE",
      url: `/api/tasks/${id}`
    })
};

// Thunk action creators
export const allTasks = (): AppThunk<Promise<ReceiveAllTasksAction>> =>
  (dispatch: Dispatch) =>
    APItask.allTasks().then((tasks) =>
      dispatch({
        type: RECEIVE_ALL_TASKS,
        tasks
      })
    );

export const showTask = (id: number): AppThunk<Promise<ReceiveTaskAction>> =>
  (dispatch: Dispatch) =>
    APItask.showTask(id).then((task) =>
      dispatch({
        type: RECEIVE_TASK,
        task
      })
    );

export const newTask = (task: Partial<Task> & { subjectName?: string }): AppThunk<Promise<ReceiveTaskAction>> =>
  (dispatch: Dispatch) =>
    APItask.newTask(task).then((task) =>
      dispatch({
        type: RECEIVE_TASK,
        task
      })
    );

export const updateTask = (task: Partial<Task>): AppThunk<Promise<ReceiveTaskAction>> =>
  (dispatch: Dispatch) =>
    APItask.updateTask(task).then((task) =>
      dispatch({
        type: RECEIVE_TASK,
        task
      })
    );

export const deleteTask = (id: number): AppThunk<Promise<DeleteTaskAction>> =>
  (dispatch: Dispatch) =>
    APItask.deleteTask(id).then((taskId) =>
      dispatch({
        type: DELETE_TASK,
        taskId
      })
    );

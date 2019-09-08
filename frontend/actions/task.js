import * as APItask from "../util/task"
export const RECEIVE_ALL_TASKS = "RECEIVE_ALL_TASKS";
export const RECEIVE_TASK = "RECEIVE_TASK";
export const DELETE_TASK = "DELETE_TASK";


export const allTasks = () => dispatch => (
    APItask.allTasks().then(tasks => dispatch({
        type: RECEIVE_ALL_TASKS,
        tasks
    }))
);


export const newTask = (task) => dispatch => (
    APItask.newTask(task).then(task => dispatch({
        type: RECEIVE_TASK,
        task
    }))
);


export const showTask = (id) => dispatch => (
    APItask.showTask(id).then(task => dispatch({
        type: RECEIVE_TASK,
        task
    }))
);


export const updateTask = (task) => dispatch => (
    APItask.updateTask(task).then(task => dispatch({
        type: RECEIVE_TASK,
        task
    }))
);


export const deleteTask = (id) => dispatch => (
    APItask.deleteTask(id).then(taskId => dispatch({
        type: DELETE_TASK,
        taskId
    }))
);

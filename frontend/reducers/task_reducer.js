import {
    RECEIVE_ALL_TASKS,
    RECEIVE_TASK,
    DELETE_TASK
} from "../actions/task"

const TaskReducer = (state = {}, action) => {
    Object.freeze(state)
    switch (action.type) {
        case RECEIVE_ALL_TASKS:
            return action.tasks;
        case RECEIVE_TASK:
            return Object.assign({},state, {[action.task.id]: action.task});
        case DELETE_TASK:
            const newState = Object.assign({}, state)
            delete newState[action.taskId]
            return newState;
        default:
            return state;
    }
}

export default TaskReducer
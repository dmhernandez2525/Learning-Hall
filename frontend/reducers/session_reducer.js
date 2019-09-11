import {
    RECEIVE_CURRENT_USER,
    LOGOUT_CURRENT_USER,
    NEW_TASK
} from "../actions/session"


const _nullSession = {
    currentUser: null,
    currentTask: "no task"
    //add last task they where on 
    //add ui loading true/false
    //add current course
}


const sessionReducer = (state = _nullSession ,action) => {
    Object.freeze(state)
    switch (action.type) {
        case RECEIVE_CURRENT_USER:
            return Object.assign({},state,{currentUser: action.user});
        case NEW_TASK:
            return Object.assign({}, state, {
                currentTask: action.task
            });
        case LOGOUT_CURRENT_USER:
            return _nullSession;
        default:
            return state;
    }
}


export default sessionReducer
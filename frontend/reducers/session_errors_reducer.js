import {
    RECEIVE_SESSION_ERRORS,
    RECEIVE_CURRENT_USER,
    CLEAR_SESSION_ERRORS
} from "../actions/session"

const sessionErrorsReducer = (state = [], action) => {
    // debugger
    switch (action.type) {
        case RECEIVE_CURRENT_USER:
            // debugger
            return [];
        case RECEIVE_SESSION_ERRORS:
            // debugger
            return action.errors;
        case CLEAR_SESSION_ERRORS:
            // debugger
            return [];
        default:
            return state;
    }
     
}

export default sessionErrorsReducer
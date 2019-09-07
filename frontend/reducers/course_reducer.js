import {
    RECEIVE_ALL_COURSES,
    RECEIVE_COURSE,
    DELETE_COURSE
} from "../actions/course"


const CourseReducer = (state = {}, action) => {
    Object.freeze(state)

    switch (action.type) {
        case RECEIVE_ALL_COURSES:
            debugger;
            return state;
        case RECEIVE_COURSE:
            debugger;
            return state;
        case DELETE_COURSE:
            debugger;
            return state;
    
        default:
            return state;
    }
}

export default CourseReducer
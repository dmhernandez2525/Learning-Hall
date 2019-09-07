import {
    RECEIVE_ALL_COURSES,
    RECEIVE_COURSE,
    DELETE_COURSE
} from "../actions/course"


const CourseReducer = (state = {}, action) => {
    Object.freeze(state)

    switch (action.type) {
        case RECEIVE_ALL_COURSES:
            return action.courses;
        case RECEIVE_COURSE:
            return Object.assign({}, state, {[action.course.id]: action.course});
        case DELETE_COURSE:
            const newState =  Object.assign({}, state);
            delete newState[action.courseId]
            return newState;
    
        default:
            return state;
    }
}

export default CourseReducer
import {
    RECEIVE_PAIN,
    NEW_COURSE
} from "../actions/switch"


import {
    RECEIVE_SUBJECT,
    DELETE_SUBJECT
}
from "../actions/subject"

import {
    RECEIVE_COURSE,
    DELETE_COURSE
}
from "../actions/course"



import {
    RECEIVE_TASK,
    DELETE_TASK
} from "../actions/task"

const _nullPain = {
    currentPain: "no Pain",
    currentCourse: "no Course"
}


const SwitcherReducer = (state = _nullPain, action) => {
    Object.freeze(state)
    switch (action.type) {
        case RECEIVE_PAIN:
            return Object.assign({}, state, {
                currentPain: action.id
            });
            
        case NEW_COURSE:
            return Object.assign({}, state, {
                currentCourse: action.CurrentCourse
            });

        case RECEIVE_COURSE:
            return Object.assign({}, state, {
                currentCourse: "no Course"
            });

        case DELETE_COURSE:
            return Object.assign({}, state, {
                currentCourse: "no Course"
            });

        case RECEIVE_SUBJECT:
            return Object.assign({}, state, {
                currentCourse: "no Course"
            });

        case DELETE_SUBJECT:
            return Object.assign({}, state, {
                currentCourse: "no Course"
            });

        case RECEIVE_TASK:
            return Object.assign({}, state, {
                currentCourse: "no Course"
            });

        case DELETE_TASK:
            return Object.assign({}, state, {
                currentCourse: "no Course"
            });

        default:
            return state;
    }
}

export default SwitcherReducer;
//this is so i can commit befor as


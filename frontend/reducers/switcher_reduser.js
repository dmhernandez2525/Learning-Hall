import {
    RECEIVE_PAIN,
    NEW_COURSE
} from "../actions/switch"

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
        default:
            return state;
    }
}

export default SwitcherReducer;



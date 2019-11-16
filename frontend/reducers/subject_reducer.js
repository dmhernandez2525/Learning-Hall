import {
RECEIVE_ALL_SUBJECTS,
RECEIVE_SUBJECT,
DELETE_SUBJECT
}
from "../actions/subject"


const SubjectReducer = (state = {}, action) => {
    Object.freeze(state)
    switch (action.type) {
        case RECEIVE_ALL_SUBJECTS:
            return action.subjects;
        case RECEIVE_SUBJECT:
            return Object.assign({},state, {[action.subject.id]: action.subject});
        case DELETE_SUBJECT:
            const newState = Object.assign({}, state )
            delete newState[action.subjectId]
            return newState;
        default:
            return state;
    }
}

export default SubjectReducer
import {RECEIVE_PAIN} from "../actions/switch"

const _nullPain = {
    currentPain: "no Pain"
}


const SwitcherReducer = (state = _nullPain, action) => {
    Object.freeze(state)
    switch (action.type) {
        case RECEIVE_PAIN:
            return Object.assign({}, state, {
                currentPain: action.id
            });
        default:
            return state;
    }
}

export default SwitcherReducer;



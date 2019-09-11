import SwitcherReducer from "./switcher_reduser"

import {
    combineReducers
} from "redux";

const UiReducer = combineReducers({
    Pain: SwitcherReducer
})

export default UiReducer
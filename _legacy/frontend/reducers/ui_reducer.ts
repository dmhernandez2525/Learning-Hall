import { combineReducers } from "redux";
import SwitcherReducer from "./switcher_reducer";

const UiReducer = combineReducers({
  Pain: SwitcherReducer
});

export default UiReducer;

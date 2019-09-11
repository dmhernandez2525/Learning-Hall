import { combineReducers } from "redux";
import entitiesReducer from './entities_reducer';
import sessionReducer from './session_reducer.js';
import errorsReducer from './errors_reducer.js';
import UiReducer from './ui_reducer';


const rootReducer = combineReducers({
    entities: entitiesReducer,
    session: sessionReducer,
    errors: errorsReducer,
    ui: UiReducer
});

export default rootReducer;
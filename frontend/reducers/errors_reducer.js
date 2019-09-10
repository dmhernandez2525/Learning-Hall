import sessionErrorsReducer from "./session_errors_reducer"
import {combineReducers} from "redux";



const errorsReducer = combineReducers({
    session: sessionErrorsReducer
    //course
    //sjubject 
    //task
});

export default errorsReducer;
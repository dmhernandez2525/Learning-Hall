import CourseReducer from "./course_reducer"
import { combineReducers } from "redux";

const entitiesReducer = combineReducers({
    courses: CourseReducer
})

export default entitiesReducer 
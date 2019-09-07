import CourseReducer from "./course_reducer"
import ModuleReducer from "./module_reducer"
import TaskReducer from "./task_reducer"
import { combineReducers } from "redux";

const entitiesReducer = combineReducers({
    courses: CourseReducer,
    modules: ModuleReducer,
    task: TaskReducer
})

export default entitiesReducer 
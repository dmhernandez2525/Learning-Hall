import CourseReducer from "./course_reducer"
import SubjectReducer from "./subject_reducer"
import TaskReducer from "./task_reducer"
import { combineReducers } from "redux";

const entitiesReducer = combineReducers({
    courses: CourseReducer,
    subject: SubjectReducer,
    task: TaskReducer
})

export default entitiesReducer 
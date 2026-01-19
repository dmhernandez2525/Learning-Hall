import { combineReducers } from "redux";
import CourseReducer from "./course_reducer";
import SubjectReducer from "./subject_reducer";
import TaskReducer from "./task_reducer";

const entitiesReducer = combineReducers({
  courses: CourseReducer,
  subject: SubjectReducer,
  task: TaskReducer
});

export default entitiesReducer;

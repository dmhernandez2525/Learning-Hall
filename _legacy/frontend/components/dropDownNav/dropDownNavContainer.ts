import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import DropDownNav from "./dropDownNav";
import { allCourses } from "../../actions/course";
import { allSubjects } from "../../actions/subject";
import { allTasks } from "../../actions/task";
import { receiveTask } from "../../actions/session";
import { receiveCourse } from "../../actions/switch";
import type { RootState, Course } from "../../types";

const mapStateToProps = (state: RootState) => ({
  courses: Object.values(state.entities.courses),
  subjects: Object.values(state.entities.subject),
  tasks: Object.values(state.entities.task),
  CurrentCourse: state.ui.Pain.currentCourse
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  allCourses: () => dispatch(allCourses() as unknown as { type: string }),
  allSubjects: () => dispatch(allSubjects() as unknown as { type: string }),
  allTasks: () => dispatch(allTasks() as unknown as { type: string }),
  receiveTask: (task: string) => dispatch(receiveTask(task)),
  receiveCourse: (CurrentCourse: Course) => dispatch(receiveCourse(CurrentCourse))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type DropDownNavContainerProps = ConnectedProps<typeof connector>;

export default connector(DropDownNav);

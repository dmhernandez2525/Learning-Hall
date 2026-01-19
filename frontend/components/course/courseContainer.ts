import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import CourseForm from "./courseForm";
import { newCourse, updateCourse, deleteCourse } from "../../actions/course";
import type { RootState, Course } from "../../types";

const mapStateToProps = (state: RootState) => ({
  course: {
    name: "",
    author_id: state.session.currentUser!.id,
    id: "",
    courseName: "",
    FormType: "Make a New Course"
  },
  allCourse: {
    courses: Object.values(state.entities.courses)
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  newCourse: (course: Partial<Course>) => dispatch(newCourse(course) as unknown as { type: string }),
  updateCourse: (course: Partial<Course>) => dispatch(updateCourse(course) as unknown as { type: string }),
  deleteCourse: (id: number) => dispatch(deleteCourse(id) as unknown as { type: string })
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type CourseContainerProps = ConnectedProps<typeof connector>;

export default connector(CourseForm);

import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { newSubject, updateSubject, deleteSubject, showSubject } from "../../actions/subject";
import SubjectForm from "./subjectForm";
import type { RootState, Subject } from "../../types";

const mapStateToProps = (state: RootState) => ({
  subject: {
    name: "",
    authorId: state.session.currentUser!.id,
    courseName: "",
    subject: "",
    FormType: "Make a New Subject"
  },
  allSubjects: {
    subjescts: Object.values(state.entities.subject)
  },
  allCourse: {
    courses: Object.values(state.entities.courses)
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  newSubject: (subject: Partial<Subject> & { courseName?: string }) =>
    dispatch(newSubject(subject) as unknown as { type: string }),
  updateSubject: (subject: Partial<Subject>) =>
    dispatch(updateSubject(subject) as unknown as { type: string }),
  showSubject: (id: number) =>
    dispatch(showSubject(id) as unknown as { type: string }) as unknown as Promise<{ subject: Subject }>,
  deleteSubject: (id: number) =>
    dispatch(deleteSubject(id) as unknown as { type: string })
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type SubjectComponentProps = ConnectedProps<typeof connector>;

export default connector(SubjectForm);

import React, { ChangeEvent, FormEvent } from "react";
import type { Subject, SubjectFormState, AllSubjects, AllCourses } from "../../types";

interface SubjectFormProps {
  subject: SubjectFormState;
  allSubjects: AllSubjects;
  allCourse: AllCourses;
  newSubject: (subject: Partial<Subject> & { courseName?: string }) => void;
  updateSubject: (subject: Partial<Subject>) => void;
  showSubject: (id: number) => Promise<{ subject: Subject }>;
  deleteSubject: (id: number) => void;
}

interface SubjectFormComponentState extends SubjectFormState {}

class SubjectForm extends React.Component<SubjectFormProps, SubjectFormComponentState> {
  private allSubjectsss: Record<string, number>;
  private subjectNames: React.ReactNode[];
  private courseNames: React.ReactNode[];

  constructor(props: SubjectFormProps) {
    super(props);
    this.state = this.props.subject;
    this.handleNew = this.handleNew.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.allSubjectsss = {};
    this.subjectNames = [];
    this.courseNames = [];
  }

  handleInput(type: keyof SubjectFormComponentState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      this.setState({ [type]: e.target.value } as Pick<SubjectFormComponentState, typeof type>);
    };
  }

  handleNew(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const newState = {
      name: this.state.name,
      authorId: this.state.authorId,
      courseName: this.state.courseName
    };
    this.props.newSubject(newState);
  }

  handleEdit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const subjectId = this.allSubjectsss[this.state.subject];
    const authorId = this.state.authorId;
    const name = this.state.name;

    this.props.showSubject(subjectId).then((response) => {
      const subject = response.subject || response;
      const newSubject = {
        id: subjectId,
        name,
        courseId: subject.courseId,
        authorId
      };
      this.props.updateSubject(newSubject);
    });
  }

  handleDelete(event: React.MouseEvent<HTMLInputElement>): void {
    event.preventDefault();
    const subjectId = this.allSubjectsss[this.state.subject];
    this.props.deleteSubject(subjectId);
  }

  render(): React.ReactNode {
    if (!this.subjectNames.length) {
      this.props.allSubjects.subjescts.forEach((subject) => {
        this.subjectNames.push(
          <option key={subject.id} value={subject.name}>
            {subject.name}
          </option>
        );
      });
      this.props.allCourse.courses.forEach((course) => {
        this.courseNames.push(
          <option key={course.id} value={course.name}>
            {course.name}
          </option>
        );
      });
    }

    this.props.allSubjects.subjescts.forEach((subject) => {
      this.allSubjectsss[subject.name] = subject.id;
    });

    if (this.state.FormType === "Make a New Subject") {
      return (
        <div className="sign_up_form" role="form" aria-label="Create new subject form">
          <form className="course-form" onSubmit={this.handleNew}>
            <h2 className="formH2">Make a New Subject</h2>
            <label htmlFor="subject-name" className="visually-hidden">
              Subject name
            </label>
            <input
              id="subject-name"
              className="bigInputProfile"
              type="text"
              value={this.state.name}
              placeholder="subject name"
              onChange={this.handleInput("name")}
              aria-required="true"
            />

            <label htmlFor="subject-course" className="visually-hidden">
              Select course
            </label>
            <select
              id="subject-course"
              className="bigSelectorProfile"
              value={this.state.courseName}
              onChange={this.handleInput("courseName")}
              aria-label="Select course for subject"
            >
              <option value="">
                Select the name of the course that you want the subject to be
                listed under
              </option>
              {this.courseNames}
            </select>

            <div className="task-buttion-div">
              <input
                className="bigButtionProfile"
                type="submit"
                value="make a new subject"
                aria-label="Submit new subject"
              />
            </div>
          </form>
          <div className="task-buttion-div">
            <input
              className="bigButtionProfile"
              type="submit"
              onClick={this.handleInput("FormType") as unknown as React.MouseEventHandler}
              value="Edit a subject"
              aria-label="Switch to edit subject mode"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="sign_up_form" role="form" aria-label="Edit subject form">
          <form className="course-form" onSubmit={this.handleEdit}>
            <h2 className="formH2">Edit Subject</h2>
            <label htmlFor="select-subject" className="visually-hidden">
              Select subject to edit
            </label>
            <select
              id="select-subject"
              className="bigSelectorProfile"
              value={this.state.subject}
              onChange={this.handleInput("subject")}
              aria-label="Select subject to edit"
            >
              <option value="">Select the subject you would like to edit</option>
              {this.subjectNames}
            </select>
            <label htmlFor="new-subject-name" className="visually-hidden">
              New subject name
            </label>
            <input
              id="new-subject-name"
              className="bigInputProfile"
              type="text"
              value={this.state.name}
              placeholder="New Name"
              onChange={this.handleInput("name")}
            />
            <div className="task-buttion-div">
              <input
                className="bigButtionProfile"
                type="submit"
                value="Edit Subject Name"
                aria-label="Save subject changes"
              />
              <input
                className="bigButtionProfile"
                type="submit"
                onClick={this.handleDelete}
                value="Delete Subject"
                aria-label="Delete this subject"
              />
            </div>
          </form>
          <div className="task-buttion-div">
            <input
              className="bigButtionProfile"
              type="submit"
              onClick={this.handleInput("FormType") as unknown as React.MouseEventHandler}
              value="Make a New Subject"
              aria-label="Switch to create subject mode"
            />
          </div>
        </div>
      );
    }
  }
}

export default SubjectForm;

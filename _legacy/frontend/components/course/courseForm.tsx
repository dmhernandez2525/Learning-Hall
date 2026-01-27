import React, { ChangeEvent, FormEvent } from "react";
import type { Course, CourseFormState, AllCourses } from "../../types";

interface CourseFormProps {
  course: CourseFormState;
  allCourse: AllCourses;
  newCourse: (course: Partial<Course>) => void;
  updateCourse: (course: Partial<Course>) => void;
  deleteCourse: (id: number) => void;
}

interface CourseFormComponentState extends CourseFormState {}

class CourseForm extends React.Component<CourseFormProps, CourseFormComponentState> {
  private allCourses: Record<string, number>;
  private courseNames: React.ReactNode[];

  constructor(props: CourseFormProps) {
    super(props);
    this.state = this.props.course;
    this.handleNew = this.handleNew.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.allCourses = {};
    this.courseNames = [];
  }

  handleInput(type: keyof CourseFormComponentState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      this.setState({ [type]: e.target.value } as Pick<CourseFormComponentState, typeof type>);
    };
  }

  handleNew(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const newState = {
      name: this.state.name,
      author_id: this.state.author_id,
      id: parseInt(this.state.id) || undefined
    };
    this.props.newCourse(newState);
  }

  handleEdit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const id = this.allCourses[this.state.courseName];
    const newCourse = {
      name: this.state.name,
      author_id: this.state.author_id,
      id
    };
    this.props.updateCourse(newCourse);
  }

  handleDelete(event: React.MouseEvent<HTMLInputElement>): void {
    event.preventDefault();
    const courseId = this.allCourses[this.state.courseName];
    this.props.deleteCourse(courseId);
  }

  render(): React.ReactNode {
    if (!this.courseNames.length) {
      this.props.allCourse.courses.forEach((course) => {
        this.courseNames.push(
          <option key={course.id} value={course.name}>
            {course.name}
          </option>
        );
      });
    }

    this.props.allCourse.courses.forEach((course) => {
      this.allCourses[course.name] = course.id;
    });

    if (this.state.FormType === "Make a New Course") {
      return (
        <div className="sign_up_form" role="form" aria-label="Create new course form">
          <form className="course-form" onSubmit={this.handleNew}>
            <h2 className="formH2">Make a New Course</h2>
            <label htmlFor="course-name" className="visually-hidden">
              Course name
            </label>
            <input
              id="course-name"
              className="bigInputProfile"
              type="text"
              value={this.state.name}
              placeholder="Course name"
              onChange={this.handleInput("name")}
              aria-required="true"
            />

            <div className="task-buttion-div">
              <input
                className="bigButtionProfile"
                type="submit"
                value="make a new Course"
                aria-label="Submit new course"
              />
            </div>
          </form>
          <div className="task-buttion-div">
            <input
              className="bigButtionProfile"
              type="submit"
              onClick={this.handleInput("FormType") as unknown as React.MouseEventHandler}
              value="Edit a Course"
              aria-label="Switch to edit course mode"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="sign_up_form" role="form" aria-label="Edit course form">
          <form className="course-form" onSubmit={this.handleEdit}>
            <h2 className="formH2">Edit Course</h2>
            <label htmlFor="select-course" className="visually-hidden">
              Select course to edit
            </label>
            <select
              id="select-course"
              className="bigSelectorProfile"
              value={this.state.courseName}
              onChange={this.handleInput("courseName")}
              aria-label="Select course to edit"
            >
              <option value="">Select the Course you would like to edit</option>
              {this.courseNames}
            </select>
            <label htmlFor="new-course-name" className="visually-hidden">
              New course name
            </label>
            <input
              id="new-course-name"
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
                value="Edit Courses Name"
                aria-label="Save course changes"
              />
              <input
                className="bigButtionProfile"
                type="submit"
                onClick={this.handleDelete}
                value="Delete Course"
                aria-label="Delete this course"
              />
            </div>
          </form>
          <div className="task-buttion-div">
            <input
              className="bigButtionProfile"
              type="submit"
              onClick={this.handleInput("FormType") as unknown as React.MouseEventHandler}
              value="Make a New Course"
              aria-label="Switch to create course mode"
            />
          </div>
        </div>
      );
    }
  }
}

export default CourseForm;

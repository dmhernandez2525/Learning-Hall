import React from "react";
import SubjectLink from "../subject/subjectLink";
import type { Course, Subject, Task } from "../../types";

interface CourseLinkProps {
  course: Course;
  subjects: Subject[];
  tasks: Task[];
  receiveTask: (task: string) => void;
}

class CourseLink extends React.Component<CourseLinkProps> {
  private course: Course;
  private subjects: Subject[];
  private tasks: Task[];

  constructor(props: CourseLinkProps) {
    super(props);
    this.course = this.props.course;
    this.subjects = this.props.subjects;
    this.tasks = this.props.tasks;
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(): void {
    const current = document.getElementById(
      `${this.course.name}+${this.course.id}`
    );
    if (current) {
      current.classList.toggle("togle_course");
    }
  }

  render(): React.ReactNode {
    const mySubjects = this.subjects.map((subject) => {
      if (subject.courseId === this.course.id) {
        return (
          <SubjectLink
            key={`subject.id${subject.name}`}
            subject={subject}
            tasks={this.tasks}
            receiveTask={this.props.receiveTask}
          />
        );
      }
      return null;
    });

    return (
      <ul role="list" aria-label={`Subjects in ${this.course.name}`}>
        <div id={`${this.course.name}+${this.course.id}`}>
          <ul role="list">{mySubjects}</ul>
        </div>
      </ul>
    );
  }
}

export default CourseLink;

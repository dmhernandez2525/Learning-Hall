import React from "react";
import CourseLink from "../course/courseLink";
import Loading from "../loading/loading";
import { Link } from "react-router-dom";
import type { Course, Subject, Task } from "../../types";

interface DropDownNavProps {
  courses: Course[];
  subjects: Subject[];
  tasks: Task[];
  CurrentCourse: Course | string;
  allCourses: () => void;
  allSubjects: () => void;
  allTasks: () => void;
  receiveTask: (task: string) => void;
  receiveCourse: (course: Course) => void;
}

class DropDownNav extends React.Component<DropDownNavProps> {
  constructor(props: DropDownNavProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickSwitch = this.handleClickSwitch.bind(this);
  }

  componentDidMount(): void {
    this.props.allCourses();
    this.props.allSubjects();
    this.props.allTasks();
  }

  handleClick(): void {
    // This method was referencing an undefined variable in the original code
    // Keeping the signature for compatibility
  }

  handleClickSwitch(): void {
    const all = document.getElementById("allCourses");
    if (all) {
      all.classList.toggle("switch-off");
    }
  }

  openCloseNav(): void {
    const stateNav = document.getElementById("mySidenav");
    if (!stateNav) return;

    const openNav = (): void => {
      const sidenav = document.getElementById("mySidenav");
      const main = document.getElementById("Main");
      if (sidenav) {
        sidenav.classList.remove("mySidenav");
        sidenav.classList.add("sidenav-togle");
      }
      if (main) {
        main.classList.remove("main-hall-as");
        main.classList.add("move");
      }
    };

    const closeNav = (): void => {
      const sidenav = document.getElementById("mySidenav");
      const main = document.getElementById("Main");
      if (sidenav) {
        sidenav.classList.remove("sidenav-togle");
        sidenav.classList.add("sidenav");
      }
      if (main) {
        main.classList.add("main-hall-as");
        main.classList.remove("move");
      }
    };

    if (stateNav.className === "sidenav") {
      openNav();
    } else {
      closeNav();
    }
  }

  render(): React.ReactNode {
    let CourseToDisplay: React.ReactNode = null;
    let courseToDisplayName: string;
    const CurrentCourse = this.props.CurrentCourse;

    if (CurrentCourse === "no Course" || typeof CurrentCourse === "string") {
      courseToDisplayName = "Please pick a course";
    } else {
      courseToDisplayName = CurrentCourse.name;
      CourseToDisplay = (
        <CourseLink
          key={CurrentCourse.id}
          course={CurrentCourse}
          subjects={this.props.subjects}
          tasks={this.props.tasks}
          receiveTask={this.props.receiveTask}
        />
      );
    }

    const courses = this.props.courses.map((course) => (
      <li key={course.id}>
        <Link
          to="#"
          onClick={() => this.props.receiveCourse(course)}
          aria-label={`Select course: ${course.name}`}
        >
          {course.name}
        </Link>
      </li>
    ));

    if (
      this.props.courses.length &&
      this.props.subjects.length &&
      this.props.tasks.length
    ) {
      document.body.classList.remove("background-loading");
      return (
        <div>
          <nav
            id="mySidenav"
            className="sidenav"
            role="navigation"
            aria-label="Course navigation"
          >
            <section className="nav-con-top">
              <h5>Current course</h5>
              <div className="nav-buttion-sub">
                <h3>{courseToDisplayName}</h3>
                <button
                  onClick={() => this.handleClickSwitch()}
                  aria-label="Switch course"
                  aria-expanded="false"
                >
                  switch
                </button>
              </div>
            </section>
            <div className="drop-down">
              <ul
                id="allCourses"
                className="switch-on"
                role="menu"
                aria-label="Available courses"
              >
                {courses}
              </ul>
              {CourseToDisplay}
            </div>
          </nav>

          <div
            className="open_bar"
            onClick={() => this.openCloseNav()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                this.openCloseNav();
              }
            }}
            aria-label="Toggle course outline sidebar"
          >
            <img src={window.handgerUrl} alt="Course outline toggle" />
            <h1 className="Course-Outline">Course Outline</h1>
          </div>
        </div>
      );
    } else {
      document.body.classList.add("background-loading");

      return (
        <div>
          <Loading />
          <nav
            id="mySidenav"
            className="sidenav"
            role="navigation"
            aria-label="Course navigation loading"
          >
            <div className="drop-down" />
          </nav>
          <div className="open_bar" aria-label="Course outline - loading">
            <img src={window.handgerUrl} alt="Course outline toggle" />
            Course Outline
          </div>
        </div>
      );
    }
  }
}

export default DropDownNav;

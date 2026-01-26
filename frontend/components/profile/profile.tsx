import React from "react";
import SubjectForm from "../subject/newSubjectComponent";
import CourseForm from "../course/courseContainer";
import TaskForm from "../task/taskformcomponent";
import type { User } from "../../types";

interface ProfileProps {
  currentUser: User;
  currentTask: string;
  signOut: () => void;
  receiveTask: (task: string) => void;
}

// Task form components lookup
const taskForms: Record<string, React.ComponentType> = {
  Course: CourseForm,
  Subject: SubjectForm,
  Task: TaskForm,
};

class Profile extends React.Component<ProfileProps> {
  render(): React.ReactNode {
    const FormComponent = taskForms[this.props.currentTask];

    return (
      <div role="main" aria-label="Profile page">
        <div className="profile-user">
          <h3>Hello {this.props.currentUser.username}</h3>
          <div className="profile-buttions" role="group" aria-label="Profile actions">
            <button
              className="user-but"
              onClick={() => this.props.receiveTask("Course")}
              aria-label="Create a new course"
            >
              Create Course
            </button>
            <button
              className="user-but"
              onClick={() => this.props.receiveTask("Subject")}
              aria-label="Create a new subject"
            >
              Create Subject
            </button>
            <button
              className="user-but"
              onClick={() => this.props.receiveTask("Task")}
              aria-label="Create a new task"
            >
              Create Task
            </button>
            <button
              className="user-but"
              onClick={() => this.props.signOut()}
              aria-label="Sign out of your account"
            >
              Sign Out
            </button>
          </div>
        </div>
        {FormComponent && <div><FormComponent /></div>}
      </div>
    );
  }
}

export default Profile;

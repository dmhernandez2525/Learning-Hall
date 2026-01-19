import React from "react";
import TaskLink from "../task/taskLink";
import type { Subject, Task } from "../../types";

interface SubjectLinkProps {
  subject: Subject;
  tasks: Task[];
  receiveTask: (task: string) => void;
}

class SubjectLink extends React.Component<SubjectLinkProps> {
  private subject: Subject;
  private tasks: Task[];
  private allTaskTime: number;
  private tasktimeLeft: number;
  private allTaskCount: number;
  private taskCountLeft: number;

  constructor(props: SubjectLinkProps) {
    super(props);
    this.subject = this.props.subject;
    this.tasks = this.props.tasks;
    this.handleClick = this.handleClick.bind(this);
    this.allTaskTime = 0;
    this.tasktimeLeft = 0;
    this.allTaskCount = 0;
    this.taskCountLeft = 0;
  }

  handleClick(): void {
    const current = document.getElementById(
      `${this.subject.name}+${this.subject.id}`
    );
    if (current) {
      current.classList.toggle("togle_subject");
    }
    const currentCir = document.getElementById(`${this.subject.id}cir`);
    if (currentCir) {
      currentCir.classList.toggle("cir-nav-click");
    }
  }

  render(): React.ReactNode {
    // Reset counters for each render
    this.allTaskTime = 0;
    this.tasktimeLeft = 0;
    this.allTaskCount = 0;
    this.taskCountLeft = 0;

    const myTasks = this.tasks
      .filter((task) => task.subject_id === this.subject.id)
      .map((task) => {
        this.allTaskTime += task.duration;
        this.allTaskCount += 1;

        if (task.completed) {
          this.taskCountLeft += 1;
          this.tasktimeLeft += task.duration;
        }

        return (
          <ul key={`task.id${task.id}`} role="listitem">
            <TaskLink task={task} receiveTask={this.props.receiveTask} />
          </ul>
        );
      });

    return (
      <li
        key={`${this.subject.name}+${this.subject.id}`}
        role="listitem"
        aria-label={`Subject: ${this.subject.name}`}
      >
        <button
          className="color-white-subjects-in-course"
          onClick={() => this.handleClick()}
          aria-expanded="false"
          aria-controls={`${this.subject.name}+${this.subject.id}`}
        >
          <div className="cir-nav">
            <div
              id={`${this.subject.id}cir`}
              aria-hidden="true"
            />
          </div>

          <div className="sub-div">
            <div>{this.subject.name}</div>
            <div className="sub-sub-div">
              {`Duration ${this.tasktimeLeft} / ${this.allTaskTime}`}
            </div>
            <div className="sub-sub-div">
              {`Task Count ${this.taskCountLeft} / ${this.allTaskCount}`}
            </div>
          </div>
        </button>
        <div
          className="togle_subject"
          id={`${this.subject.name}+${this.subject.id}`}
          role="list"
          aria-label={`Tasks in ${this.subject.name}`}
        >
          <li>{myTasks}</li>
        </div>
      </li>
    );
  }
}

export default SubjectLink;

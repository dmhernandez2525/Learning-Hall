import React from "react";
import type { Task } from "../../types";

interface TaskLinkProps {
  task: Task;
  receiveTask: (task: string) => void;
}

class TaskLink extends React.Component<TaskLinkProps> {
  private task: Task;

  constructor(props: TaskLinkProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.task = this.props.task;
  }

  handleClick(): void {
    this.props.receiveTask(this.task.body);
  }

  render(): React.ReactNode {
    const completionIcon = this.task.completed ? (
      <span aria-label="Completed">&#10003;</span>
    ) : (
      <span aria-label="Not completed">&#10007;</span>
    );

    return (
      <li className="nav-back_blue" role="listitem">
        <button
          className="color-green-subjects-in-course"
          onClick={() => this.handleClick()}
          aria-label={`Open task: ${this.task.name}`}
        >
          <span className="task-check-span">
            {completionIcon}
            <span>{this.task.name}</span>
          </span>

          <time aria-label={`Duration: ${this.task.duration} minutes`}>
            {this.task.duration}
          </time>
        </button>
        <h1 className="task-body" id={String(this.task.id)} aria-hidden="true">
          {this.task.body}
        </h1>
      </li>
    );
  }
}

export default TaskLink;

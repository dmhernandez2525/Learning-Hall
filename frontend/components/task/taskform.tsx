import React, { ChangeEvent, FormEvent } from "react";
import type { Task, TaskFormState, AllTasks, AllSubjects } from "../../types";

interface TaskFormProps {
  task: TaskFormState;
  allTasks: AllTasks;
  allSubjects: AllSubjects;
  newTask: (task: Partial<Task> & { subjectName?: string }) => void;
  updateTask: (task: Partial<Task>) => void;
  showTask: (id: number) => Promise<Task>;
  deleteTask: (id: number) => void;
}

interface TaskFormComponentState extends TaskFormState {}

class TaskForm extends React.Component<TaskFormProps, TaskFormComponentState> {
  private allTasksss: Record<string, Task>;
  private taskNames: React.ReactNode[];
  private subjectNames: React.ReactNode[];

  constructor(props: TaskFormProps) {
    super(props);
    this.state = this.props.task;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.allTasksss = {};
    this.taskNames = [];
    this.subjectNames = [];
  }

  handleInput(type: keyof TaskFormComponentState) {
    if (type === "task") {
      return (e: ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        const taskName = e.target.value;
        const newTask = this.allTasksss[taskName];
        if (newTask) {
          this.setState({
            body: newTask.body,
            duration: String(newTask.duration),
            name: newTask.name,
            [type]: taskName
          } as Pick<TaskFormComponentState, typeof type | "body" | "duration" | "name">);
        } else {
          this.setState({ [type]: taskName } as Pick<TaskFormComponentState, typeof type>);
        }
      };
    }
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      this.setState({ [type]: e.target.value } as Pick<TaskFormComponentState, typeof type>);
    };
  }

  handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const newState = {
      name: this.state.name,
      completed: true,
      duration: parseInt(this.state.duration),
      body: this.state.body,
      author_id: this.state.author_id,
      subjectName: this.state.subjectName
    };
    this.props.newTask(newState);
  }

  handleEdit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const task = this.allTasksss[this.state.task];
    if (!task) return;

    const taskId = task.id;
    const newTask = {
      id: taskId,
      name: this.state.name,
      body: this.state.body,
      duration: parseInt(this.state.duration)
    };
    this.props.updateTask(newTask);
  }

  handleDelete(event: React.MouseEvent<HTMLInputElement>): void {
    event.preventDefault();
    const task = this.allTasksss[this.state.task];
    if (task) {
      this.props.deleteTask(task.id);
    }
  }

  render(): React.ReactNode {
    if (!this.taskNames.length) {
      this.props.allSubjects.subjescts.forEach((subject) => {
        this.subjectNames.push(
          <option key={subject.id} value={subject.name}>
            {subject.name}
          </option>
        );
      });
      this.props.allTasks.tasks.forEach((task) => {
        this.taskNames.push(
          <option key={task.id} value={task.name}>
            {task.name}
          </option>
        );
      });
    }

    this.props.allTasks.tasks.forEach((task) => {
      this.allTasksss[task.name] = task;
    });

    if (this.state.FormType === "Make a New Task") {
      return (
        <div className="sign_up_form" role="form" aria-label="Create new task form">
          <form className="course-form" onSubmit={this.handleSubmit}>
            <h2 className="formH2">Make a New Task</h2>
            <label htmlFor="task-name" className="visually-hidden">
              Task name
            </label>
            <input
              id="task-name"
              className="bigInputProfile"
              type="text"
              value={this.state.name}
              placeholder="task name"
              onChange={this.handleInput("name")}
              aria-required="true"
            />
            <label htmlFor="task-duration" className="visually-hidden">
              Duration
            </label>
            <input
              id="task-duration"
              className="bigInputProfile"
              type="text"
              value={this.state.duration}
              placeholder="Duration"
              onChange={this.handleInput("duration")}
            />

            <label htmlFor="task-subject" className="visually-hidden">
              Select subject
            </label>
            <select
              id="task-subject"
              className="bigSelectorProfile"
              value={this.state.subjectName}
              onChange={this.handleInput("subjectName")}
              aria-label="Select subject for task"
            >
              <option value="">
                Select the name of the Subject that you want the Task to be
                listed under
              </option>
              {this.subjectNames}
            </select>

            <label htmlFor="task-body" className="visually-hidden">
              Task content
            </label>
            <textarea
              id="task-body"
              className="bigInputProfile"
              value={this.state.body}
              placeholder="type out a lesson here"
              onChange={this.handleInput("body")}
              aria-label="Task content"
            />

            <div className="task-buttion-div">
              <input
                className="bigButtionProfile"
                type="submit"
                value="make a new Task"
                aria-label="Submit new task"
              />
            </div>
          </form>
          <div className="task-buttion-div">
            <input
              className="bigButtionProfile"
              type="submit"
              onClick={this.handleInput("FormType") as unknown as React.MouseEventHandler}
              value="Edit a Task"
              aria-label="Switch to edit task mode"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="sign_up_form" role="form" aria-label="Edit task form">
          <form className="course-form" onSubmit={this.handleEdit}>
            <h2 className="formH2">Edit Task</h2>
            <h2 className="formH2">Task Name</h2>
            <label htmlFor="select-task" className="visually-hidden">
              Select task to edit
            </label>
            <select
              id="select-task"
              className="bigSelectorProfile"
              value={this.state.task}
              onChange={this.handleInput("task") as (e: ChangeEvent<HTMLSelectElement>) => void}
              aria-label="Select task to edit"
            >
              <option value="">Select the task you would like to edit</option>
              {this.taskNames}
            </select>

            <label htmlFor="edit-task-name" className="visually-hidden">
              New task name
            </label>
            <input
              id="edit-task-name"
              className="bigInputProfile"
              type="text"
              value={this.state.name}
              placeholder="New Name"
              onChange={this.handleInput("name")}
            />

            <label htmlFor="edit-task-duration" className="visually-hidden">
              Duration
            </label>
            <input
              id="edit-task-duration"
              className="bigInputProfile"
              type="text"
              value={this.state.duration}
              placeholder="Duration"
              onChange={this.handleInput("duration")}
            />

            <label htmlFor="edit-task-body" className="visually-hidden">
              Task content
            </label>
            <textarea
              id="edit-task-body"
              className="bigInputProfile"
              value={this.state.body}
              placeholder="type out a lesson here"
              onChange={this.handleInput("body")}
            />

            <div className="task-buttion-div">
              <input
                className="bigButtionProfile"
                type="submit"
                value="Edit Task"
                aria-label="Save task changes"
              />
              <input
                className="bigButtionProfile"
                type="submit"
                onClick={this.handleDelete}
                value="Delete Task"
                aria-label="Delete this task"
              />
            </div>
          </form>
          <div className="task-buttion-div">
            <input
              className="bigButtionProfile"
              type="submit"
              onClick={this.handleInput("FormType") as unknown as React.MouseEventHandler}
              value="Make a New Task"
              aria-label="Switch to create task mode"
            />
          </div>
        </div>
      );
    }
  }
}

export default TaskForm;

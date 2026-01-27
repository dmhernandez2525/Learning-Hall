import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { newTask, showTask, updateTask, deleteTask } from "../../actions/task";
import TaskForm from "./taskform";
import type { RootState, Task } from "../../types";

const mapStateToProps = (state: RootState) => ({
  task: {
    name: "",
    completed: true,
    duration: "",
    body: "",
    author_id: state.session.currentUser!.id,
    subject_id: "",
    subjectName: "",
    task: "",
    FormType: "Make a New Task"
  },
  allTasks: {
    tasks: Object.values(state.entities.task)
  },
  allSubjects: {
    subjescts: Object.values(state.entities.subject)
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  newTask: (task: Partial<Task> & { subjectName?: string }) =>
    dispatch(newTask(task) as unknown as { type: string }),
  updateTask: (task: Partial<Task>) =>
    dispatch(updateTask(task) as unknown as { type: string }),
  showTask: (id: number) =>
    dispatch(showTask(id) as unknown as { type: string }) as unknown as Promise<Task>,
  deleteTask: (id: number) =>
    dispatch(deleteTask(id) as unknown as { type: string })
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type TaskFormComponentProps = ConnectedProps<typeof connector>;

export default connector(TaskForm);

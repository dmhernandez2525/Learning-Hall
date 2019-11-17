import {
    connect
} from "react-redux"
import {
    newTask,showTask,updateTask,deleteTask,
} from "../../actions/task"
import TaskForm from "./taskform"

const mapStateToProps = (state) => {
    debugger
    return ({
        task: {
            name: "",
            completed: true,
            duration: "",
            body: "",
            author_id: state.session.currentUser.id,
            subject_id: "",
            subjectName: "",
            task: "",
            FormType: "Make a New Task"
        },
        allTasks: {
            tasks: Object.values(state.entities.task)
        }
    })
}

const mapDispatchToProps = (dispatch) => ({
    newTask: (task) => dispatch(newTask(task)),
    updateTask: (task) => dispatch(updateTask(task)),
    showTask: (id) => dispatch(showTask(id)),
    deleteTask: (id) => dispatch(deleteTask(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(TaskForm)
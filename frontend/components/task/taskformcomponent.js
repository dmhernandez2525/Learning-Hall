import {
    connect
} from "react-redux"
import {newTask} from "../../actions/task"
import TaskForm from "./taskform"

const mapStateToProps = (state) => ({
    task: {
        name: "",
        completed: true,
        duration: 0,
        body: "",
        author_id: state.session.currentUser.id,
        subject_id: 1
    }
})

const mapDispatchToProps = (dispatch) => ({
    newTask: (task) => dispatch(newTask(task))
})

export default connect(mapStateToProps, mapDispatchToProps)(TaskForm)
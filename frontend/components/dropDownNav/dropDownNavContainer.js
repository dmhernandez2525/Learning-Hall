import {connect} from "react-redux"
import DropDownNav from "./dropDownNav"
import {allCourses} from "../../actions/course"
import {allSubjects} from "../../actions/subject"
import {allTasks} from "../../actions/task"
const mapStateToProps = (state) => {
    return({
        courses: Object.values(state.entities.courses),
        subjects: Object.values(state.entities.subject),
        tasks: Object.values(state.entities.task)
    })
}
const mapDispatchToProps = (dispatch) => {
    return({
        allCourses: () => dispatch(allCourses()),
        allSubjects: () => dispatch(allSubjects()),
        allTasks: () => dispatch(allTasks())
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(DropDownNav)

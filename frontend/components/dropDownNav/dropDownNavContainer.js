import {connect} from "react-redux"
import DropDownNav from "./dropDownNav"
import {allCourses} from "../../actions/course"
import {allSubjects} from "../../actions/subject"
import {allTasks} from "../../actions/task"
import {receiveTask} from "../../actions/session"
import {receiveCourse} from "../../actions/switch"
const mapStateToProps = (state) => {
    return({
        courses: Object.values(state.entities.courses),
        subjects: Object.values(state.entities.subject),
        tasks: Object.values(state.entities.task),
        CurrentCourse: state.ui.Pain.currentCourse
    });
};

const mapDispatchToProps = (dispatch) => {
    return({
        allCourses: () => dispatch(allCourses()),
        allSubjects: () => dispatch(allSubjects()),
        allTasks: () => dispatch(allTasks()),
        receiveTask: (task) => dispatch(receiveTask(task)),
        receiveCourse: (CurrentCourse) => dispatch(receiveCourse(CurrentCourse))
        
    });
};

export default connect(mapStateToProps, mapDispatchToProps)(DropDownNav)

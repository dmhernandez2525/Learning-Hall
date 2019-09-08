import {connect} from "react-redux"
import Hall from "./hall"
import {allCourses} from "../../actions/course"
import {allSubjects} from "../../actions/subject"
const mapStateToProps = (state) => {
    debugger
    return({
        user: state.session.currentUser,
        courses: Object.values(state.entities.courses),
        subjects: Object.values(state.entities.subject)
    })
}
const mapDispatchToProps = (dispatch) => {
    return({
        allCourses: () => dispatch(allCourses()),
        allSubjects: () => dispatch(allSubjects())
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(Hall)

import {connect} from "react-redux"
import Hall from "./hall"
import {allCourses} from "../../actions/course"
const mapStateToProps = (state) => {
    debugger
    return({
        user: state.session.currentUser,
        courses: Object.values(state.entities.courses)
    })
}
const mapDispatchToProps = (dispatch) => {
    return({
        allCourses: () => dispatch(allCourses())
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(Hall)

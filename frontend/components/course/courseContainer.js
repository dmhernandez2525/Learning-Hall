import {connect} from "react-redux";
import CourseForm from "./courseForm"
import {newCourse} from "../../actions/course"
const mapStateToProps = (state) => ({
    course: {
        name: "",
        author_id: state.session.currentUser.id,
    }
})

const mapDispatchToProps = (dispatch) => ({
    newCourse: (course) => dispatch(newCourse(course))
})

export default connect(mapStateToProps, mapDispatchToProps)(CourseForm)
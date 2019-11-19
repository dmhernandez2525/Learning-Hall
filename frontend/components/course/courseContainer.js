import {connect} from "react-redux";
import CourseForm from "./courseForm"
import {
    newCourse,
    updateCourse,
    deleteCourse
} from "../../actions/course"
const mapStateToProps = (state) => ({
    course: {
        name: "",
        author_id: state.session.currentUser.id,
        id: "",
        courseName: "",
        FormType: "Make a New Course"
    },
    allCourse: {
        courses: Object.values(state.entities.courses)
    }
})

const mapDispatchToProps = (dispatch) => ({
    newCourse: (course) => dispatch(newCourse(course)),
    updateCourse: (course) => dispatch(updateCourse(course)),
    deleteCourse: (id) => dispatch(deleteCourse(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(CourseForm)
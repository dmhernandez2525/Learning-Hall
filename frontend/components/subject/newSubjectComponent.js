import {connect} from "react-redux"
import {newSubject,updateSubject, deleteSubject,showSubject} from "../../actions/subject"
import SubjectForm from "./subjectForm"
const mapStateToProps = (state) => {
    return ({
        subject: {
            name: "",
            authorId: state.session.currentUser.id,
            courseName: "",
            subject: "",
            FormType: "Make a New Subject"
        },
        allSubjects: {
            subjescts: Object.values(state.entities.subject)
        },
        allCourse: {
            courses: Object.values(state.entities.courses)
        }
    })
}

const mapDispatchToProps = (dispatch) => ({
    newSubject: (subject) => dispatch(newSubject(subject)),
    updateSubject: (subject) => dispatch(updateSubject(subject)),
    showSubject: (id) => dispatch(showSubject(id)),
    deleteSubject: (id) => dispatch(deleteSubject(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(SubjectForm)
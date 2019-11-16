import {connect} from "react-redux"
import {newSubject} from "../../actions/subject"
import SubjectForm from "./subjectForm"
const mapStateToProps = (state) => ({
    subject: {
        name: "",
        authorId: state.session.currentUser.id,
        courseName: ""
    }
})

const mapDispatchToProps = (dispatch) => ({
    newSubject: (subject) => dispatch(newSubject(subject))
})

export default connect(mapStateToProps, mapDispatchToProps)(SubjectForm)
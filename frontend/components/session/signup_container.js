import {connect} from "react-redux"
import {
    signUp,
    clearErrors
} from "../../actions/session"
import SignUp from "./signup"


const mapStateToProps = (state) => ({
    user: {
        username: "",
        email: "",
        preferred_name: "",
        password: "",
        user_role: "",
        pronunciation: ""
    },
    errors: state.errors.session
})

const mapDispatchToProps = (dispatch) => ({
    signUp: (user) => dispatch(signUp(user)),
    clearErrors: () => dispatch(clearErrors())
})
// debugger

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
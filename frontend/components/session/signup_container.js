import {connect} from "react-redux"
import {signUp} from "../../actions/session"
import SignUp from "./signup"


const mapStateToProps = (state) => ({
    user: {
        username: "Username",
        email: "Email",
        preferred_name: "Preferred Name",
        password: "",
        user_role: "User Role",
        pronunciation: "Pronunciation"
    }
})

const mapDispatchToProps = (dispatch) => ({
    signUp: (user) => dispatch(signUp(user))
})
// debugger

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
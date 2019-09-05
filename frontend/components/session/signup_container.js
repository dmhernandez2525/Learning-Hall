import {connect} from "react-redux"
import {signUp} from "../../actions/session"
import SignUp from "./signup"


const mapStateToProps = (state) => ({
    user: {
        username: "",
        email: "",
        preferred_name: "",
        password: "",
        user_role: "",
        pronunciation: ""
    }
})

const mapDispatchToProps = (dispatch) => ({
    signUp: (user) => dispatch(signUp(user))
})
// debugger

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
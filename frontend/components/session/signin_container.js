import {
    signIn,
    clearErrors
} from "../../actions/session"
import {connect} from "react-redux"
import SignIn from "./signin"



const mapStateToProps = (state) =>{
    return{
        user: {
                username: "",
                password: ""
            },
            errors: state.errors.session
    }
}

const mapDispatchToProps = (dispatch) => {
    return({
        signIn: (user) => dispatch(signIn(user)),
        clearErrors: () => dispatch(clearErrors())
    })
}

export default connect(mapStateToProps,mapDispatchToProps)(SignIn)
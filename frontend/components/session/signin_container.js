import {signIn} from "../../actions/session"
import {connect} from "react-redux"
import SignIn from "./signin"



const mapStateToProps = (state) =>{
    return{
        user: {username:"",password: ""}
    }
}

const mapDispatchToProps = (dispatch) => {
    return({
        signIn: (user) => dispatch(signIn(user))
    })
}

export default connect(mapStateToProps,mapDispatchToProps)(SignIn)
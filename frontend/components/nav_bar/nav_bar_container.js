import {connect} from "react-redux"
import NavBar from "./nav"
import {signOut} from "../../actions/session"


const mapStateToProps = (state) => {

    const currentUser = state.session.currentUser;
    // debugger
    return ({
        currentUser
    })
}

const mapDispatichToProps = (dispatch) =>{
    return({
        signOut: () => dispatch(signOut())
    })
}

export default connect(mapStateToProps,mapDispatichToProps)(NavBar)
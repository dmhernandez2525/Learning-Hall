import {connect} from "react-redux"
import NavBar from "./nav"
import {signOut  } from "../../actions/session"


const mapStateToProps = (state,ownProps) => {

    const currentUser = state.session.currentUser;
    return ({
        currentUser,
        history: ownProps.history.location.pathname
    })
}

const mapDispatichToProps = (dispatch) =>{
    return({
        signOut: () => dispatch(signOut())
    })
}

export default connect(mapStateToProps,mapDispatichToProps)(NavBar)
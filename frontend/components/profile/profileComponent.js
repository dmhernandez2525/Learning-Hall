import {signOut,receiveTask} from "../../actions/session";
import Profile from "./profile";
import { connect } from "react-redux";

const mapStateToProps = (state) => ({currentUser: state.session.currentUser,currentTask: state.session.currentTask})
const mapDispatchToProps = (dispatch) => ({
        signOut: () => dispatch(signOut()),
        receiveTask: (task) => dispatch(receiveTask(task))
    }
    )

export default connect(mapStateToProps,mapDispatchToProps)(Profile)
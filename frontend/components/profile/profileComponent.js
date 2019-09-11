import {signOut} from "../../actions/session";
import Profile from "./profile";
import { connect } from "react-redux";

const mapStateToProps = (state) => ({currentUser: state.session.currentUser})
const mapDispatchToProps = (dispatch) => ({signOut: () => dispatch(signOut())})

export default connect(mapStateToProps,mapDispatchToProps)(Profile)
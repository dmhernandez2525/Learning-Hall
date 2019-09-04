import {connect} from "react-redux"
import Hall from "./hall"
debugger
const mapStateToProps = (state) => {
    debugger
    return({
        user: state.session.currentUser
    })
}
debugger

export default connect(mapStateToProps, null)(Hall)

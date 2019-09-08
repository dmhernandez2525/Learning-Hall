import {connect} from "react-redux"
import Hall from "./hall"

const mapStateToProps = (state) => {
    return({
        user: state.session.currentUser
    })
}

export default connect(mapStateToProps,null)(Hall)

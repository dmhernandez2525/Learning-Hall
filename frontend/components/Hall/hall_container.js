import {connect} from "react-redux"
import Hall from "./hall"

const mapStateToProps = (state) => {
    debugger
    return({

        currentTask: state.session.currentTask
    })
}

export default connect(mapStateToProps,null)(Hall)

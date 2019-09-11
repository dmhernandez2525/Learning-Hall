import {connect} from "react-redux"
import Hall from "./hall"
import { receiveTask } from "../../actions/session"

const mapStateToProps = (state) => {
    return({

        currentTask: state.session.currentTask
    })
}
const mapDispatichToProps = (dispatch) => {
    return ({
        receiveTask: (task) => dispatch(receiveTask(task))
    })
}

export default connect(mapStateToProps, mapDispatichToProps)(Hall)

import Switch from "./switch";
import {connect} from "react-redux"
import {updatePain} from "../../actions/switch"
const mapStateToProps = (state) => {
    return {currentPane: state.ui.Pain.currentPain}
    }
const mapDispatchToProps = (dispatch) => ({updatePain: (pain) => dispatch(updatePain(pain))})
export default connect(mapStateToProps,mapDispatchToProps)(Switch) 
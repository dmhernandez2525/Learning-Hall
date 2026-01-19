import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import Switch from "./switch";
import { updatePain } from "../../actions/switch";
import type { RootState } from "../../types";

const mapStateToProps = (state: RootState) => ({
  currentPane: state.ui.Pain.currentPain
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updatePain: (pain: number | string) => dispatch(updatePain(pain))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type SwitchContainerProps = ConnectedProps<typeof connector>;

export default connector(Switch);
